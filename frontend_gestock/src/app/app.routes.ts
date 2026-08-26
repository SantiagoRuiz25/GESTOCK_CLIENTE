import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout/layout';
import { roleGuard } from './guards/role-guard/role-guard';

const todosLosRoles = [
  'Administrador', 
  'Supervisor', 
  'Operario', 
  'Operador', 
  'Técnico de Mantenimiento', 
  'Técnico Mantenimiento', 
  'Auditor'
];

export const routes: Routes = [
  {
    path: '',
    title: 'GESTOCK - Inicio',
    loadComponent: () =>
      import('./pagina/pagina').then((m) => m.PaginaComponent),
  },
  {
    path: 'auth',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
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
  { path: 'dashboard', redirectTo: 'app/panel', pathMatch: 'full' },
  {
    path: 'app',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'panel', pathMatch: 'full' },
      {
        path: 'panel',
        loadComponent: () => import('./pages/dashboard/panel/panel').then(m => m.PanelComponent),
        title: 'GESTOCK - Panel',
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Supervisor', 'Auditor'] }
      },
      {
        path: 'panel/:id',
        loadComponent: () => import('./pages/dashboard/panel/panel').then(m => m.PanelComponent),
        title: 'GESTOCK - Panel',
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Supervisor', 'Auditor'] }
      },
      {
        path: 'empresas',
        loadComponent: () => import('./pages/dashboard/empresa/empresa').then(m => m.EmpresasComponent),
        title: 'GESTOCK - Empresas',
        canActivate: [roleGuard],
        data: { roles: ['Administrador'] }
      },
      {
        path: 'gestion/inventario',
        loadComponent: () => import('./pages/gestion/inventario/inventario').then(m => m.InventarioComponent),
        canActivate: [roleGuard],
        data: { roles: todosLosRoles },
        children: [
          { path: '', redirectTo: 'lista-productos', pathMatch: 'full' },
          { path: 'lista-productos', loadComponent: () => import('./pages/gestion/inventario/lista-productos/lista-productos').then(m => m.ListaProductosComponent) },
          { path: 'registrar-productos', loadComponent: () => import('./pages/gestion/inventario/registrar-productos/registrar-productos').then(m => m.RegistrarProductosComponent) },
          { path: 'bodegas', loadComponent: () => import('./pages/gestion/inventario/bodegas/bodegas').then(m => m.BodegasComponent) }
        ]
      },
      {
        path: 'recepcion/recepcion-mercancias',
        title: 'GESTOCK - Recepción de Mercancías',
        loadComponent: () => import('./pages/recepcion/recepcion-mercancias/recepcion-mercancias').then(m => m.RecepcionMercanciasComponent),
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Supervisor', 'Operario', 'Operador'] }
      },
      {
        path: 'recepcion/historial-logistico',
        title: 'GESTOCK - Historial Logístico',
        loadComponent: () => import('./pages/recepcion/historial-logistico/historial-logistico').then(m => m.HistorialLogisticoComponent),
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Supervisor', 'Técnico de Mantenimiento', 'Técnico Mantenimiento', 'Auditor'] }
      },
      {
        path: 'gestion/auditorias',
        loadComponent: () => import('./pages/gestion/auditorias/auditorias').then(m => m.AuditoriasComponent),
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Auditor'] }
      },
      {
        path: 'gestion/roles-yusuarios',
        loadComponent: () => import('./pages/gestion/roles-yusuarios/roles-yusuarios').then(m => m.RolesUsuariosComponent),
        canActivate: [roleGuard],
        data: { roles: ['Administrador'] }
      },
      // (Ruta de envíos eliminada por completo)
      {
        path: 'reportes',
        title: 'GESTOCK - Reportes y Estadísticas',
        loadComponent: () => import('./pages/reportes/reportes').then((m) => m.ReportesComponent),
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Supervisor', 'Auditor'] }
      },
      {
        path: 'configuracion',
        title: 'GESTOCK - Configuración del Sistema',
        loadComponent: () => import('./pages/configuracion/configuracion').then((m) => m.ConfiguracionComponent),
        canActivate: [roleGuard],
        data: { roles: todosLosRoles }
      },
      {
        path: 'programacion',
        loadComponent: () => import('./pages/mantenimiento/programacion-mantenimiento/programacion-mantenimiento.component').then(m => m.ProgramacionMantenimientoComponent),
        title: 'Programación - Gestock',
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Supervisor', 'Técnico de Mantenimiento', 'Técnico Mantenimiento'] }
      },
      {
        path: 'incidencias',
        loadComponent: () => import('./pages/mantenimiento/registro-incidencias/registro-incidencias.component').then(m => m.IncidenciasComponent),
        title: 'Incidencias - Gestock',
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Supervisor', 'Operario', 'Operador', 'Técnico de Mantenimiento', 'Técnico Mantenimiento'] }
      },
      { path: '**', redirectTo: 'panel' }
    ],
  },
  { path: '**', redirectTo: '' }
];