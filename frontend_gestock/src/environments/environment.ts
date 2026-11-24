/**
 * Configuración por defecto.
 *
 * Angular la usa cuando ninguna configuración reemplaza este archivo, es
 * decir en los tests y en la comprobación de tipos del IDE. El build de
 * producción la sustituye por `environment.production.ts` y el de desarrollo
 * por `environment.development.ts`, según lo declarado en `angular.json`
 * (`fileReplacements`).
 *
 * Mantener los tres archivos es obligatorio: sin este, el IDE y los tests
 * no resuelven el import y `tsc` falla aunque el build web pase.
 */
export const environment = {
  production: true,

  /** Base de la API REST. Relativa: mismo origen, sin CORS. */
  apiUrl: '/api',

  /**
   * Cuando es `true` los datos salen del adaptador local en vez de la red.
   * Va en `false` en producción siempre: la demo no debe llegar a usuarios.
   */
  useMockApi: false,

  http: {
    timeoutMs: 20_000,
  },

  auth: {
    accessTokenKey: 'gestock.access_token',
    refreshTokenKey: 'gestock.refresh_token',
    headerName: 'Authorization',
    refreshHeaderName: 'X-Refresh-Token',
  },
} as const;
