import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';

import { environment } from '../../../environments/environment';
import { SessionService } from '../services/session.service';
import { ApiError } from '../models/api.model';
import {
  authInterceptor,
  errorInterceptor,
  timeoutInterceptor,
} from './http.interceptors';

const REFRESH_URL = `${environment.apiUrl}/auth/refresh`;

describe('interceptors HTTP', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let session: SessionService;
  let navegar: ReturnType<typeof vi.fn>;
  let original: number;

  /**
   * Monta el TestBed. `refresh` simula si existe refresh token.
   * `resetTestingModule` es necesario porque algunos tests lo llaman otra vez
   * con `refresh: false` para partir de una sesión ausente.
   */
  function montar(refresh = true): void {
    TestBed.resetTestingModule();
    sessionStorage.clear();

    if (refresh) {
      sessionStorage.setItem(environment.auth.accessTokenKey, 'token-caducado');
      sessionStorage.setItem(environment.auth.refreshTokenKey, 'refresh-xyz');
      sessionStorage.setItem(
        `${environment.auth.accessTokenKey}.usuario`,
        JSON.stringify({ id: 1, nombre: 'Ana', email: 'ana@gestock.com', rol: 'Administrador' }),
      );
    }

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([timeoutInterceptor, authInterceptor, errorInterceptor]),
        ),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    session = TestBed.inject(SessionService);

    navegar = vi.fn().mockResolvedValue(true);
    TestBed.inject(Router).navigate = navegar as unknown as Router['navigate'];
  }

  beforeEach(montar);

  afterEach(() => {
    // `verify` se quejará de peticiones sin responder, y eso es justo lo que
    // deja el test del timeout: la petición se cortó, pero el backend de
    // pruebas la sigue teniendo registrada. Se resuelven antes de verificar.
    for (const pendiente of httpMock.match(() => true)) {
      // Si el timeout ya la canceló, `flush` lanza; en ese caso la petición
      // está resuelta y solo hay que sacarla del registro.
      try {
        pendiente.flush(null);
      } catch {
        httpMock.verify({ ignoreCancelled: true });
      }
    }
    httpMock.verify();
    sessionStorage.clear();
  });

  describe('authInterceptor', () => {
    it('debe adjuntar el token en Authorization', () => {
      http.get('/inventario/productos').subscribe();

      const peticion = httpMock.expectOne('/inventario/productos');
      expect(peticion.request.headers.get('Authorization')).toBe('Bearer token-caducado');
      peticion.flush([]);
    });

    it('no debe adjuntar token a las rutas de autenticación', () => {
      http.post('/auth/login', {}).subscribe();

      const peticion = httpMock.expectOne('/auth/login');
      expect(peticion.request.headers.has('Authorization')).toBe(false);
      peticion.flush({});
    });

    it('debe dejar pasar la petición sin token si no hay sesión', () => {
      montar(false);

      http.get('/inventario/productos').subscribe();

      const peticion = httpMock.expectOne('/inventario/productos');
      expect(peticion.request.headers.has('Authorization')).toBe(false);
      peticion.flush([]);
    });
  });

  describe('errorInterceptor', () => {
    it('debe traducir un 403 a ApiError con el mensaje del backend', () => {
      let capturado: unknown;
      http.get('/inventario/productos').subscribe({ error: (e) => (capturado = e) });

      httpMock
        .expectOne('/inventario/productos')
        .flush({ mensaje: 'Acceso denegado.' }, { status: 403, statusText: 'Forbidden' });

      expect(capturado).toBeInstanceOf(ApiError);
      expect((capturado as ApiError).status).toBe(403);
      expect((capturado as ApiError).mensaje).toBe('Acceso denegado.');
    });

    it('debe inventar un mensaje cuando el backend no envía cuerpo parseable', () => {
      let capturado: unknown;
      http.get('/inventario/productos').subscribe({ error: (e) => (capturado = e) });

      httpMock
        .expectOne('/inventario/productos')
        .flush('Error interno', { status: 500, statusText: 'Server Error' });

      expect((capturado as ApiError).mensaje).toContain('servidor');
    });

    it('debe propagar los errores por campo del backend', () => {
      let capturado: unknown;
      http.post('/inventario/productos', {}).subscribe({ error: (e) => (capturado = e) });

      httpMock.expectOne('/inventario/productos').flush(
        {
          mensaje: 'Datos inválidos.',
          erroresCampos: { nombre: 'Este campo es obligatorio.' },
        },
        { status: 422, statusText: 'Unprocessable' },
      );

      expect((capturado as ApiError).erroresCampos).toEqual({
        nombre: 'Este campo es obligatorio.',
      });
    });

    it('debe reportar falta de conexión cuando el status es 0', () => {
      let capturado: unknown;
      http.get('/inventario/productos').subscribe({ error: (e) => (capturado = e) });

      httpMock
        .expectOne('/inventario/productos')
        .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

      expect((capturado as ApiError).status).toBe(0);
      expect((capturado as ApiError).mensaje).toContain('conexión');
    });
  });

  describe('refresh ante 401', () => {
    it('debe renovar el token y reintentar la petición una sola vez', () => {
      let resultado: unknown;
      http.get('/inventario/productos').subscribe({ next: (r) => (resultado = r) });

      httpMock
        .expectOne('/inventario/productos')
        .flush({ detalle: 'Token expirado' }, { status: 401, statusText: 'Unauthorized' });

      const refresh = httpMock.expectOne(REFRESH_URL);
      expect(refresh.request.headers.get('X-Refresh-Token')).toBe('refresh-xyz');
      refresh.flush({ accessToken: 'token-nuevo' });

      const reintento = httpMock.expectOne('/inventario/productos');
      expect(reintento.request.headers.get('Authorization')).toBe('Bearer token-nuevo');
      reintento.flush([{ id: 1 }]);

      expect(resultado).toEqual([{ id: 1 }]);
      expect(session.getAccessToken()).toBe('token-nuevo');
      expect(navegar).not.toHaveBeenCalled();
    });

    it('debe lanzar un único refresh cuando varias peticiones fallan a la vez', () => {
      // Caso real del panel: seis peticiones simultáneas con el token caducado.
      // Sin deduplicar, seis refresh; cinco fallarían porque el primero ya
      // rotó el token, y el usuario vería un cierre de sesión espurio.
      for (let i = 0; i < 6; i++) {
        http.get(`/inventario/recurso-${i}`).subscribe({ error: () => undefined });
        httpMock
          .expectOne(`/inventario/recurso-${i}`)
          .flush({}, { status: 401, statusText: 'Unauthorized' });
      }

      const refreshes = httpMock.match(REFRESH_URL);
      expect(refreshes).toHaveLength(1);
      refreshes[0].flush({ accessToken: 'token-nuevo' });

      for (let i = 0; i < 6; i++) {
        const reintento = httpMock.expectOne(`/inventario/recurso-${i}`);
        expect(reintento.request.headers.get('Authorization')).toBe('Bearer token-nuevo');
        reintento.flush([]);
      }

      expect(navegar).not.toHaveBeenCalled();
    });

    it('debe cortar la sesión si el propio refresh falla', () => {
      let capturado: unknown;
      http.get('/inventario/productos').subscribe({ error: (e) => (capturado = e) });

      httpMock
        .expectOne('/inventario/productos')
        .flush({}, { status: 401, statusText: 'Unauthorized' });
      httpMock
        .expectOne(REFRESH_URL)
        .flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(capturado).toBeInstanceOf(ApiError);
      expect((capturado as ApiError).status).toBe(401);
      expect(navegar).toHaveBeenCalled();
      expect(session.autenticado()).toBe(false);
    });

    it('no debe refrescar en bucle si el token nuevo también falla', () => {
      // Reintentar en bucle dispararía refresh indefinidamente.
      http.get('/inventario/productos').subscribe({ error: () => undefined });

      httpMock
        .expectOne('/inventario/productos')
        .flush({}, { status: 401, statusText: 'Unauthorized' });
      httpMock.expectOne(REFRESH_URL).flush({ accessToken: 'token-nuevo' });

      httpMock
        .expectOne('/inventario/productos')
        .flush({}, { status: 401, statusText: 'Unauthorized' });

      httpMock.expectNone(REFRESH_URL);
      expect(navegar).toHaveBeenCalled();
    });

    it('debe cortar la sesión directamente si no hay refresh token', () => {
      montar(false);

      let capturado: unknown;
      http.get('/inventario/productos').subscribe({ error: (e) => (capturado = e) });

      httpMock
        .expectOne('/inventario/productos')
        .flush({}, { status: 401, statusText: 'Unauthorized' });

      httpMock.expectNone(REFRESH_URL);
      expect(capturado).toBeInstanceOf(ApiError);
      expect(navegar).toHaveBeenCalled();
    });
  });

  describe('timeoutInterceptor', () => {
    /**
     * Se baja el límite a 5 ms en vez de simular el reloj: el timeout de
     * RxJS se agenda con el `asyncScheduler`, que no pasa por los fake
     * timers de Vitest de forma fiable. Con 5 ms reales el test sigue siendo
     * instantáneo y prueba el camino real.
     */
    beforeEach(() => {
      original = environment.http.timeoutMs;
      (environment.http as { timeoutMs: number }).timeoutMs = 5;
    });

    afterEach(() => {
      (environment.http as { timeoutMs: number }).timeoutMs = original;
    });

    it('debe convertir una espera agotada en ApiError 408', async () => {
      let capturado: unknown;
      http.get('/inventario/productos').subscribe({ error: (e) => (capturado = e) });

      await new Promise((r) => setTimeout(r, 40));

      expect(capturado).toBeInstanceOf(ApiError);
      expect((capturado as ApiError).status).toBe(408);
      expect((capturado as ApiError).mensaje).toContain('demasiado');
    });

    it('no debe cortar una respuesta que llega a tiempo', async () => {
      let resultado: unknown;
      http.get('/inventario/productos').subscribe({ next: (r) => (resultado = r) });

      httpMock.expectOne('/inventario/productos').flush([{ id: 1 }]);
      await new Promise((r) => setTimeout(r, 40));

      expect(resultado).toEqual([{ id: 1 }]);
    });
  });
});
