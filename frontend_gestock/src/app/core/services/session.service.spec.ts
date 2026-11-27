import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { SessionService } from './session.service';
import { ApiError } from '../models/api.model';
import { DEMO_USUARIOS } from '../data/demo-usuarios';
import { environment } from '../../../environments/environment';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    // `localStorage` también: el padrón de cuentas demo vive ahí, y si no se
    // limpia las pruebas de registro se filtran entre sí.
    localStorage.clear();
    sessionStorage.clear();
    service = TestBed.inject(SessionService);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('debe rechazar credenciales incorrectas con un ApiError 401', async () => {
    await expect(
      firstValueFrom(service.login('admin@gestock.com', 'incorrecta')),
    ).rejects.toThrowError(ApiError);

    expect(service.autenticado()).toBe(false);
  });

  it('debe autenticar con credenciales válidas y exponer el usuario', async () => {
    const usuario = await firstValueFrom(service.login('admin@gestock.com', '123'));

    expect(usuario.rol).toBe('Administrador');
    expect(service.autenticado()).toBe(true);
    expect(service.esAdministrador()).toBe(true);
  });

  it('debe ser insensible a mayúsculas y espacios en el correo', async () => {
    const usuario = await firstValueFrom(
      service.login('  ADMIN@GESTOCK.COM  ', '123'),
    );

    expect(usuario.email).toBe('admin@gestock.com');
  });

  it('debe emitir un token con forma de JWT', async () => {
    await firstValueFrom(service.login('admin@gestock.com', '123'));

    const token = service.getAccessToken();
    expect(token).toBeTruthy();
    // Tres segmentos separados por puntos, como un JWT.
    expect(token!.split('.')).toHaveLength(3);
  });

  it('debe limpiar tokens y usuario al cerrar sesión', async () => {
    await firstValueFrom(service.login('admin@gestock.com', '123'));
    expect(sessionStorage.length).toBeGreaterThan(0);

    service.logout({ navegar: false });

    expect(service.getAccessToken()).toBeNull();
    expect(service.autenticado()).toBe(false);
    expect(sessionStorage.length).toBe(0);
  });

  it('no debe autenticar si el correo no existe', async () => {
    await expect(
      firstValueFrom(service.login('nadie@gestock.com', '123')),
    ).rejects.toThrowError(ApiError);

    expect(service.autenticado()).toBe(false);
  });

  it('debe cubrir todos los roles de la semilla con su contraseña', async () => {
    for (const usuario of DEMO_USUARIOS) {
      const sesion = await firstValueFrom(service.login(usuario.email, usuario.password));
      expect(sesion.rol).toBe(usuario.rol);
      service.logout({ navegar: false });
    }
  });

  it('debe autenticar con la contraseña elegida en el registro demo', async () => {
    // Regresión: `registrarDemo` fijaba la contraseña en 'demo' e ignoraba la
    // que el usuario escribía, así que la cuenta creada era inusable.
    await firstValueFrom(
      service.registrarDemo({
        nombre: 'Nueva Operaria',
        email: 'nueva@gestock.com',
        password: 'miClaveFuerte',
        rol: 'Operario',
      }),
    );
    service.logout({ navegar: false });

    const sesion = await firstValueFrom(
      service.login('nueva@gestock.com', 'miClaveFuerte'),
    );
    expect(sesion.email).toBe('nueva@gestock.com');
  });

  it('no debe autenticar con una contraseña distinta a la registrada', async () => {
    await firstValueFrom(
      service.registrarDemo({
        nombre: 'Otra',
        email: 'otra@gestock.com',
        password: 'correcta',
        rol: 'Operario',
      }),
    );
    service.logout({ navegar: false });

    await expect(
      firstValueFrom(service.login('otra@gestock.com', 'incorrecta')),
    ).rejects.toThrowError(ApiError);
  });

  it('debe rechazar en producción el registro local', async () => {
    // Guarda y restaura la bandera: el resto de la suite depende de demo.
    const original = environment.useMockApi;
    (environment as { useMockApi: boolean }).useMockApi = false;
    try {
      await expect(
        firstValueFrom(
          service.registrarDemo({
            nombre: 'X',
            email: 'x@gestock.com',
            password: 'p',
            rol: 'Operario',
          }),
        ),
      ).rejects.toThrow();
    } finally {
      (environment as { useMockApi: boolean }).useMockApi = original;
    }
  });

  it('debe exponer null en getRefreshToken si no hay sesión', () => {
    expect(service.getRefreshToken()).toBeNull();
  });

  it('debe exponer el refresh token tras iniciar sesión', async () => {
    await firstValueFrom(service.login('admin@gestock.com', '123'));
    expect(service.getRefreshToken()).toBeTruthy();
  });
});
