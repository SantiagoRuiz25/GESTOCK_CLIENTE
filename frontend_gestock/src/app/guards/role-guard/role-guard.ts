import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth'; // Importación correcta al AuthService

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const usuario = authService.obtenerUsuarioActual();
  const rolesPermitidos = route.data['roles'] as Array<string>;

  if (usuario && usuario.rol && rolesPermitidos.includes(usuario.rol)) {
    return true;
  }

  // Redirige al panel si no tiene permisos
  router.navigate(['/app/panel']);
  return false;
};