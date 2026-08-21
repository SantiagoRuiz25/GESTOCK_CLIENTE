import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout/layout'; // Ajusta la ruta si tu layout está en otra carpeta (ej: './components/layout/layout')

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'gestion/inventario', pathMatch: 'full' },
      
      // Módulo de Inventario con su propio espacio
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
      
      // Módulo de Roles y Usuarios (con asignación de permisos)
      {
        path: 'gestion/roles-yusuarios',
        loadComponent: () => import('./pages/gestion/roles-yusuarios/roles-yusuarios').then(m => m.RolesUsuariosComponent)
      }
    ]
  }
];