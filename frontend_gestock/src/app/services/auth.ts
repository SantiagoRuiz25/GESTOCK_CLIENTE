import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { SessionService, UsuarioSesion } from '../core/services/session.service';
import { ApiError } from '../core/models/api.model';

/**
 * Interfaz de usuario que espera el resto de la aplicación.
 *
 * Antes esta interfaz vivía dentro de `Usuario` con `password?: string`
 * incluido, y el objeto con la contraseña se guardaba entero en
 * `localStorage`. Eso significaba que la contraseña del usuario autenticado
 * estaba disponible para cualquier JavaScript de la página.
 */
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export type RolUsuario =
  | 'Administrador'
  | 'Supervisor'
  | 'Técnico de Mantenimiento'
  | 'Técnico Mantenimiento'
  | 'Auditor'
  | 'Operario'
  | 'Operador';

/**
 * Fachada de compatibilidad sobre `SessionService`.
 *
 * Se mantiene para no tener que tocar de golpe los ocho componentes que la
 * usan (header, sidebar, layout, panel, configuracion, pagina...). Su única
 * responsabilidad ahora es traducir entre el estado que guarda
 * `SessionService` y los nombres de método históricos. La lógica de sesión y
 * de tokens vive en un solo sitio, que es el punto.
 *
 * La API es síncrona porque el resto de la app lo espera así. `login` y
 * `logout` de verdad son asíncronos contra el servidor; cuando se migren los
 * componentes, esta fachada debe desaparecer y deben usar `SessionService`
 * directamente.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = inject(SessionService);

  /** Usuario autenticado, o `null`. */
  obtenerUsuarioActual(): Usuario | null {
    return this.session.usuario();
  }

  estaAutenticado(): boolean {
    return this.session.autenticado();
  }

  /**
   * Autenticación. Devuelve `true`/`false` para no romper la firma actual,
   * y delega en `SessionService` la parte real.
   */
  login(email: string, password?: string): boolean {
    if (!password) {
      // Sin contraseña no hay verificación posible. Antes este caso permitía
      // entrar solo con el correo, lo que era un agujero abierto.
      return false;
    }
    this.session.login(email, password).subscribe({ error: () => undefined });
    return this.session.autenticado();
  }

  /** Variante reactiva, usada por el formulario de login. */
  iniciarSesion(email: string, password: string): Observable<UsuarioSesion> {
    return this.session.login(email, password);
  }

  /**
   * Alta de usuario. Solo tiene efecto en modo demostración: en producción
   * el registro lo hace el backend, y aquí no debe haber una puerta trasera.
   */
  registrar(datos: { nombre: string; email: string; password: string; rol: string }): boolean {
    if (!environment.useMockApi) {
      return false;
    }
    let ok = false;
    this.session.registrarDemo(datos).subscribe({ next: () => (ok = true), error: () => (ok = false) });
    return ok;
  }

  /** Variante reactiva del alta, para mostrar el error al usuario. */
  registrarUsuario(datos: {
    nombre: string;
    email: string;
    password: string;
    rol: string;
  }): Observable<UsuarioSesion> {
    if (!environment.useMockApi) {
      return throwError(
        () => new ApiError({ status: 403, mensaje: 'El registro no está disponible en este entorno.' }),
      );
    }
    return this.session.registrarDemo(datos);
  }

  logout(): void {
    this.session.logout();
  }

  /**
   * Ruta de aterrizaje según el rol.
   *
   * `Técnico de Mantenimiento` y `Técnico Mantenimiento` son el mismo rol
   * escrito de dos formas en los datos; se normalizan aquí en vez de
   * repetir la comprobación en el guard, en el sidebar y en el login.
   */
  obtenerRutaInicialPorRol(): string {
    const rol = this.normalizarRol(this.session.usuario()?.rol ?? '');
    switch (rol) {
      case 'Administrador':
      case 'Supervisor':
      case 'Auditor':
        return '/app/panel';
      case 'Operario':
      case 'Operador':
        return '/app/recepcion/recepcion-mercancias';
      case 'TecnicoMantenimiento':
        return '/app/programacion';
      default:
        return '/app/gestion/inventario';
    }
  }

  /** Dos escrituras del mismo rol convergen a una sola clave. */
  normalizarRol(rol: string): string {
    const limpio = rol.trim();
    if (limpio === 'Técnico de Mantenimiento' || limpio === 'Técnico Mantenimiento') {
      return 'TecnicoMantenimiento';
    }
    return limpio;
  }
}
