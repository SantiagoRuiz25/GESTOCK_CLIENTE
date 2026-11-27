import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../../services/auth';
import { ToastService } from '../../core/services/toast.service';

/**
 * Guarda de autorización por rol.
 *
 * Dos correcciones sobre la versión anterior:
 *
 * 1. Distingue "no has iniciado sesión" de "no tienes permiso". Antes ambos
 *    casos caían en el mismo `router.navigate(['/app/panel'])`, así que un
 *    usuario sin sesión veía el panel —que además tiene su propio guard— y
 *    terminaba en un bucle de redirecciones.
 *
 * 2. Compara con el rol normalizado. Los datos traen dos escrituras del mismo
 *    rol ("Técnico de Mantenimiento" y "Técnico Mantenimiento"); con la
 *    comparación literal, un técnico con la segunda forma pasaba directo y
 *    acababa en un panel sin permisos.
 *
 * OJO: esto es control de experiencia de usuario, NO de seguridad. Una guarda
 * del lado del cliente se puede saltar desde la consola. La autorización real
 * tiene que validarla el servidor en cada endpoint; este código solo evita
 * que el usuario llegue a pantallas que no le tocan.
 */
export const roleGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const toast = inject(ToastService);
  const router = inject(Router);

  if (!authService.estaAutenticado()) {
    toast.aviso('Inicia sesión para acceder a esa sección.');
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  const rolesPermitidos = _route.data['roles'] as string[] | undefined;
  const usuario = authService.obtenerUsuarioActual();

  if (!rolesPermitidos || rolesPermitidos.length === 0 || !usuario) {
    return true;
  }

  const permitido = rolesPermitidos.some(
    (rol) => authService.normalizarRol(rol) === authService.normalizarRol(usuario.rol),
  );

  if (permitido) {
    return true;
  }

  toast.aviso('No tienes permisos para ver esa sección.');
  return router.createUrlTree(['/app/panel']);
};
