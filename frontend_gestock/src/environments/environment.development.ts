/**
 * ConfiguraciÃ³n de la aplicaciÃ³n para DESARROLLO.
 *
 * `useMockApi: true` mantiene la interfaz fully operable sin backend, de modo
 * que puedas construir UI sin bloquearte esperando la API. Cuando el backend
 * Go/Django estÃ© arriba, cambia a `false` y todo el flujo va contra `apiUrl`.
 */
export const environment = {
  productosMidUrl: '/v1/productos',
  production: false,

  /** URL absoluta en desarrollo: el backend corre en otro puerto, hay CORS. */
  apiUrl: 'http://localhost:8080/api',

  /**
   * Datos servidos desde el adaptador local. Poner en `false` en cuanto
   * exista el backend para probar el flujo real de extremo a extremo.
   */
  useMockApi: true,

  http: {
    /** Sin timeout en desarrollo: los reinicios del backend son lentos. */
    timeoutMs: 0,
  },

  auth: {
    accessTokenKey: 'gestock.access_token',
    refreshTokenKey: 'gestock.refresh_token',
    headerName: 'Authorization',
    refreshHeaderName: 'X-Refresh-Token',
  },
} as const;
