import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  TimeoutError,
  catchError,
  finalize,
  shareReplay,
  switchMap,
  throwError,
  timeout,
} from 'rxjs';

import { environment } from '../../../environments/environment';
import { SessionService } from '../services/session.service';
import { ApiError, ApiErrorBody } from '../models/api.model';

/**
 * Marca una petición que ya es el reintento tras un refresh. Sin esto, si el
 * token nuevo también fuera rechazado, el interceptor entraría en bucle:
 * 401 → refresh → 401 → refresh... hasta que el servidor_TIMEOUT.
 */
const YA_REINTENTADA = new HttpContextToken<boolean>(() => false);

/**
 * Refresh en curso, compartido por todas las peticiones que fallen a la vez.
 *
 * Es el motivo de que este archivo tenga estado a nivel de módulo. Al abrir
 * el panel se lanzan seis peticiones a la vez (productos, bodegas, métricas);
 * si el token caducó justo antes, las seis reciben 401. Sin `shareReplay`
 * se dispararían seis refresh simultáneos, cinco devolverían 401 porque el
 * primero ya rotó el token, y el usuario vería un cierre de sesión
 * espurio. Con un solo refresh compartido, las seis se reintentan.
 */
let refrescoEnCurso: Observable<string> | null = null;

function refrescarToken(session: SessionService): Observable<string> {
  refrescoEnCurso ??= session.refreshAccessToken().pipe(
    // `finalize` va ANTES de `shareReplay` a propósito: así el reseteo ocurre
    // cuando la fuente termina o falla, una sola vez, no por suscriptor.
    finalize(() => (refrescoEnCurso = null)),
    shareReplay({ bufferSize: 1, refCount: false }),
  );
  return refrescoEnCurso;
}

/**
 * Fallback cuando el backend no envía cuerpo de error parseable, que es lo
 * habitual con los 500 de Django y los errores de proxy.
 */
function mensajePorDefecto(status: number): string {
  switch (status) {
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'El recurso solicitado no existe.';
    case 409:
      return 'Ya existe un registro con esos datos.';
    case 422:
      return 'Los datos enviados no son válidos.';
    default:
      return status >= 500
        ? 'Ocurrió un error en el servidor. Inténtalo de nuevo en unos minutos.'
        : 'No se pudo completar la solicitud.';
  }
}

/** Cierra sesión y devuelve al login. Concentrado aquí para no repetirlo. */
function cortarSesion(
  session: SessionService,
  router: Router,
  url: string,
): Observable<never> {
  session.logout({ navegar: false });
  void router.navigate(['/auth/login'], {
    queryParams: { returnUrl: router.url },
  });
  return throwError(
    () =>
      new ApiError({
        status: 401,
        mensaje: 'Tu sesión expiró. Vuelve a iniciar sesión.',
        url,
      }),
  );
}

/**
 * Corta la petición cuando el backend no contesta a tiempo.
 *
 * Sin esto, una petición colgada deja el botón en estado "cargando" para
 * siempre: el `error` del observable nunca se emite, así que ni el spinner
 * ni el toast de fallo llegan a aparecer. El usuario solo ve una pantalla
 * congelada sin ninguna pista de qué pasó.
 */
export const timeoutInterceptor: HttpInterceptorFn = (req, next) => {
  const limite = environment.http.timeoutMs;
  if (limite <= 0) {
    return next(req);
  }

  return next(req).pipe(
    timeout(limite),
    catchError((fallo: unknown) => {
      if (fallo instanceof TimeoutError) {
        return throwError(
          () =>
            new ApiError({
              status: 408,
              mensaje: 'El servidor tardó demasiado en responder. Inténtalo de nuevo.',
              url: req.url,
            }),
        );
      }
      return throwError(() => fallo);
    }),
  );
};

/**
 * Normaliza cualquier fallo HTTP a un `ApiError` con mensaje presentable.
 *
 * Sin esto, cada componente tendría que manejar por su cuenta los cuatro
 * casos que realmente importan al usuario: sin red, 401, 403 y 5xx. Al
 * hacerlo una vez aquí, los componentes solo miran `err instanceof ApiError`.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((fallo: unknown) => {
      // El backend todavía no responde: no hay red, CORS bloqueó la
      // respuesta, o el servidor no arrancó. Mensaje accionable.
      if (fallo instanceof HttpErrorResponse && fallo.status === 0) {
        return throwError(
          () =>
            new ApiError({
              status: 0,
              mensaje: 'No se pudo conectar con el servidor. Verifica tu conexión.',
              url: req.url,
            }),
        );
      }

      if (!(fallo instanceof HttpErrorResponse)) {
        return throwError(() => fallo);
      }

      /**
       * Token caducado. Se intenta recuperar antes de rendirse, que es lo
       * que evita que el usuario pierda su trabajo a mitad de una operación
       * por un token que se renovó hace un minuto.
       */
      if (fallo.status === 401) {
        const esRutaDeAuth =
          req.url.includes('/auth/login') || req.url.includes('/auth/refresh');
        const yaReintentada = req.context.get(YA_REINTENTADA);
        const hayRefresh = session.getRefreshToken() !== null;

        if (!esRutaDeAuth && !yaReintentada && hayRefresh) {
          return refrescarToken(session).pipe(
            switchMap((token) =>
              next(
                req.clone({
                  context: req.context.set(YA_REINTENTADA, true),
                  setHeaders: { [environment.auth.headerName]: `Bearer ${token}` },
                }),
              ),
            ),
            // Si el refresh falla (también 401, porque el refresh token
            // caducó), la sesión ya no es recuperable.
            catchError(() => cortarSesion(session, router, req.url)),
          );
        }

        return cortarSesion(session, router, req.url);
      }

      const cuerpo = fallo.error as Partial<ApiErrorBody> | null;
      const mensaje = cuerpo?.mensaje ?? mensajePorDefecto(fallo.status);

      if (fallo.status >= 500) {
        // Se registra el traceId para que soporte pueda correlacionar sin
        // exponer el HTML de error de Django/Beego al usuario.
        console.error(
          `[API ${fallo.status}] ${req.method} ${req.url}`,
          cuerpo?.traceId ?? 'sin traceId',
          fallo.error,
        );
      }

      return throwError(
        () =>
          new ApiError({
            status: fallo.status,
            mensaje,
            erroresCampos: cuerpo?.erroresCampos,
            traceId: cuerpo?.traceId,
            url: req.url,
          }),
      );
    }),
  );
};

/**
 * Añade el token de acceso a las peticiones salientes.
 *
 * También evita adjuntarlo a las llamadas de autenticación: enviar un token
 * caducado al endpoint de login provoca que algunos backends respondan 401
 * en lugar de 400, y el mensaje de error termina siendo engañoso.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(SessionService).getAccessToken();
  const esRutaPublica =
    req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

  if (!token || esRutaPublica) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { [environment.auth.headerName]: `Bearer ${token}` },
    }),
  );
};

