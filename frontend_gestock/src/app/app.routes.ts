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

  // Ruta del sistema interno con Sidebar/Layout
  {
    path: 'app',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'reportes',
        pathMatch: 'full',
      },
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
      // CAPTURA CUALQUIER OTRA RUTA O CLIC DENTRO DEL PANEL INTERNO
      {
        path: '**',
        redirectTo: 'reportes',
      },
    ],
  },

  // Redirige URLs externas inexistentes a la landing page
  {
    path: '**',
    redirectTo: '',
  },
];