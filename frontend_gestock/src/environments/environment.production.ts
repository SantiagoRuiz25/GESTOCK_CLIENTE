/**
 * Configuración de la aplicación para el entorno de PRODUCCIÓN.
 *
 * `apiUrl` es una ruta RELATIVA a propósito: al servir el frontend y la API
 * bajo el mismo origen, el navegador no aplica CORS en absoluto. Si en tu
 * despliegue la API vive en otro dominio, cámbiala por la URL absoluta
 * y configura `allowedOrigins` en el servidor.
 */
export const environment = {
  production: true,

  /** Base de la API REST. Relativa: mismo origen, sin CORS. */
  apiUrl: '/api',

  /**
   * Cuando es `true` los servicios sirven datos desde un adaptador local
   * en vez de golpear la red. Se activa para poder desarrollar y demostrar
   * la interfaz antes de tener el backend desplegado. Ponlo en `false` en
   * cuanto el backend esté disponible.
   */
  useMockApi: false,

  http: {
    /** Tiempo máximo de espera antes de abortar una petición. */
    timeoutMs: 20_000,
  },

  auth: {
    /** Clave del token de acceso en sessionStorage. */
    accessTokenKey: 'gestock.access_token',
    /** Clave del token de refresco en sessionStorage. */
    refreshTokenKey: 'gestock.refresh_token',
    /** Cabecera used para enviar el token. */
    headerName: 'Authorization',
    /** Cabecera para el refresh (evita preflight CORS adicional). */
    refreshHeaderName: 'X-Refresh-Token',
  },
} as const;
