import { Component } from '@angular/core';
<<<<<<< HEAD
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
=======
import { RouterLink, RouterLinkActive } from '@angular/router';
>>>>>>> 6166258ec228d9f3699b3c007f7757005c72bda7

@Component({
  selector: 'app-sidebar',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  constructor(private router: Router) {}

  // Métodos de navegación alternativa (opcionales si usas routerLink en el HTML)
  irAProgramacion(): void {
    this.router.navigate(['/app/programacion-mantenimiento']);
  }

  irAIncidencias(): void {
    this.router.navigate(['/app/registro-incidencias']);
  }

  // Redirección al login en el módulo de autenticación
  logout(): void {
    this.router.navigate(['/auth/login']);
  }
}
=======
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {}
>>>>>>> 6166258ec228d9f3699b3c007f7757005c72bda7
