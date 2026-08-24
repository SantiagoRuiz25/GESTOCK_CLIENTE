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
      },
      {
        path: 'sesiones-activas',
        loadComponent: () => import('./pages/auth/sesiones-activas/sesiones-activas').then(m => m.SesionesActivasComponent),
        title: 'Sesiones Activas - Gestock'
      }
    ]
  },

  // Ruta del sistema interno con Sidebar/Layout que agrupa todas las secciones
  {
    path: 'app',
    component: LayoutComponent,
    children: [
      {  path: '', redirectTo: 'gestion/inventario', pathMatch: 'full' },

      // Dashboard
      {
        path: 'panel',
        loadComponent: () => import('./pages/dashboard/panel/panel').then(m => m.PanelComponent),
        title: 'GESTOCK - Panel'
      },
      {
        path: 'panel/:id',
        loadComponent: () => import('./pages/dashboard/panel/panel').then(m => m.PanelComponent),
        title: 'GESTOCK - Panel'
      },
      {
        path: 'empresas',
        loadComponent: () => import('./pages/dashboard/empresa/empresa').then(m => m.EmpresaComponent),
        title: 'GESTOCK - Empresas'
      },

      // Módulo de Inventario con sus subrutas },
      
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
      
      // Nuevos Módulos de Recepción y Logística
      {
        path: 'recepcion/recepcion-mercancias',
        title: 'GESTOCK - Recepción de Mercancías',
        loadComponent: () => import('./pages/recepcion/recepcion-mercancias/recepcion-mercancias').then(m => m.RecepcionMercanciasComponent)
      },
      {
        path: 'recepcion/historial-logistico',
        title: 'GESTOCK - Historial Logístico',
        loadComponent: () => import('./pages/recepcion/historial-logistico/historial-logistico').then(m => m.HistorialLogisticoComponent)
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

      // Módulos adicionales
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
      
      // Mantenimiento
      {
        path: 'programacion',
        loadComponent: () => import('./pages/mantenimiento/programacion-mantenimiento/programacion-mantenimiento.component').then(m => m.ProgramacionMantenimientoComponent),
        title: 'Programación - Gestock'
      },
      {
        path: 'incidencias',
        loadComponent: () => import('./pages/mantenimiento/registro-incidencias/registro-incidencias.component').then(m => m.RegistroIncidenciasComponent),
        title: 'Registro de Incidencias - Gestock'
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