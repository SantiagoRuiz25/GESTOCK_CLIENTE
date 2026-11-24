import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, defer, map, of, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DEMO_USUARIOS } from '../data/demo-usuarios';
import { ApiError } from '../models/api.model';

/** Usuarios creados desde el formulario de registro en modo demo. */
const CLAVE_USUARIOS_DEMO = 'gestock.demo.usuarios';

/**
 * Identidad del usuario autenticado. Es lo único que la UI necesita conocer;
 * nunca el password, ni siquiera en modo demo.
 */
export interface UsuarioSesion {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

interface RespuestaLogin {
  accessToken: string;
  refreshToken: string;
  usuario: UsuarioSesion;
}

/**
 * Fuente única de verdad del estado de autenticación y de los tokens.
 *
 * Por qué reemplazar a los `localStorage` sueltos que había antes:
 * el código anterior leía y escribía la sesión en dos claves distintas
 * (`gestock_usuario_sesion` y `gestock_session`) desde archivos diferentes,
 * y los interceptors no tenían de dónde leer el token. Aquí hay un solo
 * responsable y una sola clave por token.
 *
 * `sessionStorage` en vez de `localStorage`: al cerrar la pestaña se pierde
 * la sesión, lo que reduce la ventana de exposición a XSS. Lo ideal sigue
 * siendo una cookie httpOnly emitida por el servidor, que es justo lo que
 * debería hacer la API real.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = environment.apiUrl;
  private readonly authConfig = environment.auth;

  private readonly _usuario = signal<UsuarioSesion | null>(this.leerUsuarioPersistido());

  /** Usuario autenticado, o `null`. */
  readonly usuario = this._usuario.asReadonly();

  /** Derivado, para las plantillas: evita repetir `usuario()?.rol`. */
  readonly autenticado = computed(() => this._usuario() !== null);

  readonly esAdministrador = computed(() => this._usuario()?.rol === 'Administrador');

  /** Token de acceso en memoria; evita leer `sessionStorage` en cada petición. */
  private accessToken: string | null = null;

  constructor() {
    this.accessToken = this.leer(this.authConfig.accessTokenKey);
  }

  /**
   * Autenticación. Con `useMockApi` activo valida contra la semilla local;
   * en producción siempre va contra el servidor.
   */  login(email: string, password: string): Observable<UsuarioSesion> {
    if (environment.useMockApi) {
      // `defer` es obligatorio, no cosmético: escribir
      // `of(this.loginDemo(...))` evaluaría el argumento ANTES de construir
      // el Observable, con lo que `loginDemo` lanzaría la excepción de forma
      // sincrónica. El `error` ni siquiera se vería: se escaparía hacia
      // arriba y el `subscribe({ error })` del formulario nunca se llamaría.
      return defer(() => {
        try {
          return of(this.loginDemo(email, password));
        } catch (fallo) {
          return throwError(() => fallo);
        }
      });
    }

    return this.http
      .post<RespuestaLogin>(`${this.baseUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => this.persistirSesion(res)),
        map((res) => res.usuario),
      );
  }

  /**
   * Canjea el refresh token por un access token nuevo.
   *
   * Se invoca desde el interceptor cuando la API responde 401, de modo que
   * un token caducado sea invisible para el usuario en vez de un error bruto.
   */
  refreshAccessToken(): Observable<string> {
    const refreshToken = this.leer(this.authConfig.refreshTokenKey);
    if (!refreshToken) {
      return throwError(() => new Error('No hay refresh token almacenado.'));
    }

    // El refresh token viaja en una cabecera propia, no en el cuerpo ni en
    // Authorization: es la única petición que debe mandar el token largo
    // aunque el de acceso ya haya caducado.
    return this.http
      .post<{ accessToken: string }>(
        `${this.baseUrl}/auth/refresh`,
        {},
        { headers: { [this.authConfig.refreshHeaderName]: refreshToken } },
      )
      .pipe(
        map((res) => res.accessToken),
        tap((token) => {
          this.accessToken = token;
          this.guardar(this.authConfig.accessTokenKey, token);
        }),
      );
  }

  /** Token vigente, o `null` si no hay sesión. */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Refresh token almacenado, o `null`.
   *
   * Lo consulta el interceptor para decidir si un 401 es recuperable. Si no
   * hay sesión, un 401 significa simplemente "no entraste", y no hay nada
   * que renovar.
   */
  getRefreshToken(): string | null {
    return this.leer(this.authConfig.refreshTokenKey);
  }

  /**
   * Cierre de sesión.
   *
   * El token se revoca en el servidor cuando hay backend. Si esa llamada
   * falla, la sesión local se limpia igual: quedarse dentro por no haber
   * podido avisar al servidor sería peor UX que un token huérfano, que
   * caduca por sí solo.
   */
  logout(options: { navegar?: boolean } = {}): void {
    const { navegar = true } = options;

    const revocar = environment.useMockApi
      ? of(null)
      : this.http.post(`${this.baseUrl}/auth/logout`, {}).pipe(catchError(() => of(null)));

    revocar.subscribe(() => {
      this.limpiar();
      if (navegar) {
        void this.router.navigate(['/auth/login']);
      }
    });
  }

  /**
   * Registra un usuario para el modo demo.
   *
   * Solo tiene sentido con `useMockApi: true`. En producción el alta la hace
   * el backend, así que este método debe desaparecer cuando se conecte la
   * API real: mantenerlo sería dejar una puerta abierta en producción.
   */
  registrarDemo(datos: {
    nombre: string;
    email: string;
    password: string;
    rol: string;
  }): Observable<UsuarioSesion> {
    if (!environment.useMockApi) {
      return throwError(
        () => new Error('El registro local solo existe en modo demostración.'),
      );
    }

    const email = datos.email.trim().toLowerCase();

    if (this.usuariosDemoRegistrados().some((u) => u.email === email)) {
      return throwError(
        () => new ApiError({
          status: 409,
          mensaje: 'Ya existe una cuenta con ese correo.',
          erroresCampos: { email: 'Este correo ya está registrado.' },
        }),
      );
    }

    const usuario: UsuarioSesion = {
      id: Date.now(),
      nombre: datos.nombre.trim(),
      email,
      rol: datos.rol,
    };

    /**
     * Se guarda la contraseña que el usuario escribió, no una constante.
     * La versión anterior fijaba siempre `'demo'`, así que una cuenta creada
     * desde el formulario era imposible de usar después: el usuario escribía
     * su contraseña, la aceptaba el alta, y al entrar le decía "credenciales
     * incorrectas" sin explicación posible.
     *
     * Sigue sin ser un hash. Para una demo es aceptable porque el bundle
     * ya contiene las contraseñas de la semilla de todas formas; el día que
     * se conecte el backend esto desaparece, porque el hash lo calcula el
     * servidor.
     */
    // `localStorage` explícito, no el helper `guardar()` de sesión: esta
    // lista no es parte de la sesión activa, es el padrón de cuentas de la
    // demo y debe sobrevivir al logout.
    localStorage.setItem(
      CLAVE_USUARIOS_DEMO,
      JSON.stringify([...this.usuariosDemoRegistrados(), { ...usuario, password: datos.password }]),
    );
    return of(usuario);
  }

  /**
   * Login contra la semilla local. Deliberadamente sin hashear: recordemos
   * que el hash también viajaría en el bundle, así que no aportaría nada.
   */
  private loginDemo(email: string, password: string): UsuarioSesion {
    const normalizado = email.trim().toLowerCase();
    const encontrados = [...DEMO_USUARIOS, ...this.usuariosDemoRegistrados()];
    const encontrado = encontrados.find(
      (u) => u.email.toLowerCase() === normalizado && u.password === password,
    );

    if (!encontrado) {
      throw new ApiError({
        status: 401,
        mensaje: 'Credenciales incorrectas.',
      });
    }

    const usuario: UsuarioSesion = {
      id: encontrado.id,
      nombre: encontrado.nombre,
      email: encontrado.email,
      rol: encontrado.rol,
    };

    // Tokens ficticios pero con forma de JWT, para que el interceptor tenga
    // algo real que adjuntar y el flujo se parezca al de producción.
    const tokenFalso = this.tokenDemo(usuario, Date.now() + 3_600_000);

    this.accessToken = tokenFalso;
    this.guardar(this.authConfig.accessTokenKey, tokenFalso);
    this.guardar(this.authConfig.refreshTokenKey, this.tokenDemo(usuario, Date.now() + 86_400_000));
    this._usuario.set(usuario);
    this.guardar(this.leerUsuarioKey(), JSON.stringify(usuario));

    return usuario;
  }

  /**
   * Lee el padrón de cuentas creadas en la demo.
   *
   * Va en `localStorage` a propósito, y no en `sessionStorage` como el resto
   * de la sesión: una cuenta registrada debe sobrevivir al cierre de sesión
   * y al cierre de la pestaña, igual que la semilla `DEMO_USUARIOS`. Con
   * `sessionStorage` desaparecía al recargar y el alta se perdía.
   */
  private usuariosDemoRegistrados(): Array<UsuarioSesion & { password: string }> {
    if (typeof localStorage === 'undefined') {
      return [];
    }
    const crudo = localStorage.getItem(CLAVE_USUARIOS_DEMO);
    if (!crudo) {
      return [];
    }
    try {
      const lista = JSON.parse(crudo);
      return Array.isArray(lista) ? lista : [];
    } catch {
      return [];
    }
  }

  private tokenDemo(usuario: UsuarioSesion, expiraEn: number): string {
    const cabecera = this.base64Url({ alg: 'HS256', typ: 'JWT' });
    const cuerpo = this.base64Url({
      sub: String(usuario.id),
      email: usuario.email,
      rol: usuario.rol,
      exp: Math.floor(expiraEn / 1000),
    });
    return `${cabecera}.${cuerpo}.demo-firma-no-verificable`;
  }

  /**
   * Codifica a base64url. Usa `btoa`, que existe en todos los navegadores
   * modernos y también en Node 18+, así que sirve para navegador y para el
   * render en servidor sin ramificar por plataforma.
   */
  private base64Url(objeto: object): string {
    const json = JSON.stringify(objeto);
    // El slice a 3 bytes es previo al Base64: sin él, `btoa` falla con
    // caracteres fuera del rango Latin-1, que es justo lo que pasa con
    // acentos y ñ en los nombres de usuario.
    const utf8 = unescape(encodeURIComponent(json));
    return btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private persistirSesion(res: RespuestaLogin): void {
    this.accessToken = res.accessToken;
    this.guardar(this.authConfig.accessTokenKey, res.accessToken);
    this.guardar(this.authConfig.refreshTokenKey, res.refreshToken);
    this._usuario.set(res.usuario);
    this.guardar(this.leerUsuarioKey(), JSON.stringify(res.usuario));
  }

  private limpiar(): void {
    this.accessToken = null;
    this.borrar(this.authConfig.accessTokenKey);
    this.borrar(this.authConfig.refreshTokenKey);
    this.borrar(this.leerUsuarioKey());
    this._usuario.set(null);
  }

  private leerUsuarioKey(): string {
    return `${environment.auth.accessTokenKey}.usuario`;
  }

  /**
   * `sessionStorage` no existe durante el render en servidor. Sin este guard
   * el SSR revienta con `ReferenceError`, que es justo lo que pasa al
   * desplegar con `@angular/ssr`.
   */
  private leer(key: string): string | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    return sessionStorage.getItem(key);
  }

  private guardar(key: string, valor: string): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    sessionStorage.setItem(key, valor);
  }

  private borrar(key: string): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    sessionStorage.removeItem(key);
  }

  private leerUsuarioPersistido(): UsuarioSesion | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    const crudo = sessionStorage.getItem(`${this.authConfig.accessTokenKey}.usuario`);
    if (!crudo) {
      return null;
    }
    try {
      return JSON.parse(crudo) as UsuarioSesion;
    } catch {
      // Dato corrupto: se descarta en vez de romper el arranque de la app.
      sessionStorage.removeItem(`${this.authConfig.accessTokenKey}.usuario`);
      return null;
    }
  }
}
