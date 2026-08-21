import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
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