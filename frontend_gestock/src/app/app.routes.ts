import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout/layout';

export const routes: Routes = [
  // Ruta raíz: landing page informativa
  {
    path: '',
    title: 'GESTOCK - Inicio',
    loadComponent: () =>
      import('./pagina/pagina').then((m) => m.PaginaComponent),
  },

  // Ruta del sistema interno con Sidebar/Layout que agrupa todas las secciones
  {
    path: 'app',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'gestion/inventario', pathMatch: 'full' },
      
      // Módulo de Inventario con sus subrutas
      {
        path: 'gestion/inventario',
        loadComponent: () => import('./pages/gestion/inventario/inventario').then(m => m.InventarioComponent),
        children: [
          { path: '', redirectTo: 'lista-productos', pathMatch: 'full' },
          { path: 'lista-productos', loadComponent: () => import('./pages/gestion/inventario/lista-productos/lista-productos').then(m => m.ListaProductosComponent) },
          { path: 'registrar-productos', loadComponent: () => import('./pages/gestion/inventario/registrar-productos/registrar-productos').then(m => m.RegistrarProductosComponent) },
          { path: 'bodegas', loadComponent: () => import('./pages/gestion/inventario/bodegas/bodegas').then(m => m.BodegasComponent) }
        ]
      },
      
      // Módulo de Auditoría
      {
        path: 'gestion/auditorias',
        loadComponent: () => import('./pages/gestion/auditorias/auditorias').then(m => m.AuditoriasComponent)
      },
      
      // Módulo de Roles y Usuarios
      {
        path: 'gestion/roles-yusuarios',
        loadComponent: () => import('./pages/gestion/roles-yusuarios/roles-yusuarios').then(m => m.RolesUsuariosComponent)
      },

      // Módulos adicionales de la otra rama
      {
        path: 'reportes',
        title: 'GESTOCK - Reportes y Estadísticas',
        loadComponent: () =>
          import('./pages/reportes/reportes').then((m) => m.ReportesComponent),
      },
      {
        path: 'envios',
        title: 'GESTOCK - Gestión de Envíos',
        loadComponent: () =>
          import('./pages/envio/envio').then((m) => m.EnviosComponent),
      },
      {
        path: 'configuracion',
        title: 'GESTOCK - Configuración del Sistema',
        loadComponent: () =>
          import('./pages/configuracion/configuracion').then(
            (m) => m.ConfiguracionComponent
          ),
      },
      
      // Captura cualquier ruta interna errónea dentro de /app
      {
        path: '**',
        redirectTo: 'gestion/inventario',
      },
    ],
  },

  // Redirige URLs externas inexistentes a la landing page principal
  {
    path: '**',
    redirectTo: '',
  },
];