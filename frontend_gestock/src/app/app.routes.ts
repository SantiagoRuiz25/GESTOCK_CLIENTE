import { Routes } from '@angular/router';

export const routes: Routes = [
  // Redirección inicial
  { 
    path: '', 
    redirectTo: 'auth/login', 
    pathMatch: 'full' 
  },

  // Módulo de Autenticación (Pantallas independientes sin Header/Sidebar)
  {
    path: 'auth',
    children: [
      { 
        path: '', 
        redirectTo: 'login', 
        pathMatch: 'full' 
      },
      { 
        path: 'login', 
        loadComponent: () => import('./pages/auth/login/login').then(m => m.LoginComponent),
        title: 'Iniciar Sesión - Gestock'
      },
      { 
        path: 'crear-usuario', 
        loadComponent: () => import('./pages/auth/creacion-usuarios/creacion-usuarios').then(m => m.CreacionUsuariosComponent),
        title: 'Crear Usuario - Gestock'
      },
      { 
        path: 'recuperar-contrasena', 
        loadComponent: () => import('./pages/auth/recuperacion-contrasena/recuperacion-contrasena').then(m => m.RecuperacionContrasenaComponent),
        title: 'Recuperar Contraseña - Gestock'
      }
    ]
  },

  // Layout Principal (Contiene Sidebar, Header, Footer y vistas centrales)
  {
    path: 'app',
    loadComponent: () => import('./layout/layout/layout').then(m => m.LayoutComponent),
    children: [
      { 
        path: '', 
        redirectTo: 'panel', 
        pathMatch: 'full' 
      },
      {
        path: 'panel',
        loadComponent: () => import('./pages/dashboard/panel/panel').then(m => m.PanelComponent),
        title: 'Panel de Control - Gestock'
      },
      {
        path: 'panel/:id',
        loadComponent: () => import('./pages/dashboard/panel/panel').then(m => m.PanelComponent),
        title: 'Panel de Control - Gestock'
      },
      {
        path: 'empresas',
        loadComponent: () => import('./pages/dashboard/empresa/empresa').then(m => m.EmpresaComponent),
        title: 'Empresas - Gestock'
      },
      {
        path: 'programacion',
        loadComponent: () => import('./pages/mantenimiento/programacion-mantenimiento/programacion-mantenimiento.component').then(m => m.ProgramacionMantenimientoComponent),
        title: 'Programación - Gestock'
      },
      {
        path: 'incidencias',
        loadComponent: () => import('./pages/mantenimiento/registro-incidencias/registro-incidencias.component').then(m => m.RegistroIncidenciasComponent),
        title: 'Registro de Incidencias - Gestock'
      }
    ]
  },

  // Ruta Comodín (Redirige cualquier URL no válida al Login)
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];