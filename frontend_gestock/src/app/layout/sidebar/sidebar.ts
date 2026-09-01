import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  section: 'PANEL' | 'GESTIÓN' | 'MANTENIMIENTO';
  rolesPermitidos: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  usuarioActual: Usuario | null = null;

  private todosLosRoles: string[] = [
    'Administrador',
    'Supervisor',
    'Operario',
    'Operador',
    'Técnico de Mantenimiento',
    'Técnico Mantenimiento',
    'Auditor'
  ];

  menuItems: MenuItem[] = [
    // PANEL
    { 
      label: 'Panel', 
      icon: '📊', 
      route: '/app/panel', 
      section: 'PANEL', 
      rolesPermitidos: ['Administrador', 'Supervisor', 'Auditor'] 
    },
    { 
      label: 'Empresas', 
      icon: '🏢', 
      route: '/app/empresas', 
      section: 'PANEL', 
      rolesPermitidos: ['Administrador'] 
    },
    { 
      label: 'Configuración', 
      icon: '⚙️', 
      route: '/app/configuracion', 
      section: 'PANEL', 
      rolesPermitidos: this.todosLosRoles 
    },

    // GESTIÓN
    { 
      label: 'Inventario', 
      icon: '📦', 
      route: '/app/gestion/inventario', 
      section: 'GESTIÓN', 
      rolesPermitidos: this.todosLosRoles
    },
    { 
      label: 'Recepción', 
      icon: '📥', 
      route: '/app/recepcion/recepcion-mercancias', 
      section: 'GESTIÓN', 
      rolesPermitidos: ['Administrador', 'Supervisor', 'Operario', 'Operador'] 
    },
    { 
      label: 'Historial Logístico', 
      icon: '📋', 
      route: '/app/recepcion/historial-logistico', 
      section: 'GESTIÓN', 
      rolesPermitidos: ['Administrador', 'Supervisor', 'Técnico de Mantenimiento', 'Técnico Mantenimiento', 'Auditor'] 
    },
    { 
      label: 'Auditorías', 
      icon: '📑', 
      route: '/app/gestion/auditorias', 
      section: 'GESTIÓN', 
      rolesPermitidos: ['Administrador', 'Auditor'] 
    },
    { 
      label: 'Roles y Usuarios', 
      icon: '👤', 
      route: '/app/gestion/roles-yusuarios', 
      section: 'GESTIÓN', 
      rolesPermitidos: ['Administrador'] 
    },
    // (Ítem de Envíos eliminado de aquí)

    // MANTENIMIENTO
    { 
      label: 'Programación', 
      icon: '🛠️', 
      route: '/app/programacion', 
      section: 'MANTENIMIENTO', 
      rolesPermitidos: ['Administrador', 'Supervisor', 'Técnico de Mantenimiento', 'Técnico Mantenimiento'] 
    },
    { 
      label: 'Incidencias', 
      icon: '⚠️', 
      route: '/app/incidencias', 
      section: 'MANTENIMIENTO', 
      rolesPermitidos: ['Administrador', 'Supervisor', 'Operario', 'Operador', 'Técnico de Mantenimiento', 'Técnico Mantenimiento'] 
    },
    {
      section: 'GESTIÓN', // o la sección donde prefieras ubicarlo ('PANEL' o 'MANTENIMIENTO')
      label: 'Reportes',
      icon: '📊', // O el emoji/icono que utilices
      route: '/app/reportes',
      rolesPermitidos: ['Administrador', 'Gerente', 'Operador'] // Ajusta según los roles que deban verlo
    }
  ];

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuarioActual();
  }

  esPermitido(rolesPermitidos: string[]): boolean {
    const rolActual = this.usuarioActual?.rol || '';
    return rolesPermitidos.includes(rolActual);
  }

  tieneItemsVisibles(section: string): boolean {
    return this.menuItems.some(item => item.section === section && this.esPermitido(item.rolesPermitidos));
  }
}