import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout/layout';

export const routes: Routes = [
  // Ruta raíz: landing page informativa
  {
    path: '',
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
        loadComponent: () =>
          import('./pages/reportes/reportes').then((m) => m.ReportesComponent),
      },
      {
        path: 'envios',
        loadComponent: () =>
          import('./pages/envio/envio').then((m) => m.EnviosComponent),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./pages/configuracion/configuracion').then(
            (m) => m.ConfiguracionComponent
          ),
      },
      // CAPTURA CUALQUIER OTRA RUTA O CLIC DENTRO DEL PANEL
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