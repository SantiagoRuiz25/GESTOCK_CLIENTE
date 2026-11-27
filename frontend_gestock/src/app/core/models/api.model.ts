/**
 * Contratos de error que la API debe respetar.
 *
 * Centralizar la forma del error evita el antipatrón habitual de
 * `catch (e) { alert((e as any).error.mensaje) }`, que se rompe en cuanto
 * el backend devuelve un 500 con cuerpo vacío o un 403 sin cuerpo.
 */
export interface ApiErrorBody {
  /** Mensaje legible, ya listo para mostrar al usuario. */
  mensaje: string;
  /** Errores por campo, claveados por nombre de propiedad del formulario. */
  erroresCampos?: Record<string, string>;
  /** Identificador de traza para el soporte; lo registro en la consola. */
  traceId?: string;
}

export interface ApiListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Error normalizado que reciben los componentes.
 *
 * Se construye siempre a partir de una respuesta HTTP real, nunca a mano,
 * para que el mensaje que ve el usuario sea consistente en toda la app.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly erroresCampos: Record<string, string>;
  readonly traceId?: string;
  readonly url?: string;

  constructor(init: {
    status: number;
    mensaje: string;
    erroresCampos?: Record<string, string>;
    traceId?: string;
    url?: string;
  }) {
    super(init.mensaje);
    this.name = 'ApiError';
    this.status = init.status;
    this.erroresCampos = init.erroresCampos ?? {};
    this.traceId = init.traceId;
    this.url = init.url;
  }

  /** 401/403: la sesión caducó o el rol no tiene permiso. */
  get esDeAutorizacion(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /** 5xx: el fallo es del servidor, no del usuario. */
  get esDeServidor(): boolean {
    return this.status >= 500;
  }

  /** 0: fallo de red, CORS bloqueado o el servidor no responde. */
  get esDeRed(): boolean {
    return this.status === 0;
  }

  /** 409: conflicto de integridad, típicamente código duplicado. */
  get esDeConflicto(): boolean {
    return this.status === 409;
  }

  /**
   * Alias en español de `message`.
   *
   * `message` viene impuesto por `Error`; el resto de la app habla en
   * español, y hacer que las dos opciones convivan invita a bugs por
   * confusión. La UI usa siempre esta.
   */
  get mensaje(): string {
    return this.message;
  }
}
