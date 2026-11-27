import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  provideRouter,
  withComponentInputBinding,
  withHashLocation,
  withInMemoryScrolling,
} from '@angular/router';

import { routes } from './app.routes';
import {
  authInterceptor,
  errorInterceptor,
  timeoutInterceptor,
} from './core/interceptors/http.interceptors';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(
      routes,
      /**
       * Hash en las URLs: es lo que permite servir el build como archivos
       * estáticos sin una regla de rewrite en el servidor. Sin esto, un
       * recargado en /app/panel daría 404. Si en tu despliegue hay
       * configuración de servidor capaz de reescribir, quítalo y gana
       * legibilidad de URL.
       */
      withHashLocation(),
      /** Evita el `ActivatedRoute` en cada componente para leer query params. */
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
    ),

    provideHttpClient(
      /**
       * El orden importa:
       * 1. `timeoutInterceptor` acota cada petición. Va primero para que el
       *    reloj empiece a correr ya, y no después de añadir cabeceras.
       * 2. `authInterceptor` añade el token a las peticiones que sí lo llevan.
       * 3. `errorInterceptor` normaliza el fallo. Si fuera primero, vería
       *    peticiones sin cabecera de autorización.
       */
      withInterceptors([timeoutInterceptor, authInterceptor, errorInterceptor]),
    ),
  ],
};
