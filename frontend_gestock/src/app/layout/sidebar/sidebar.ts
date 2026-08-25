import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {

  constructor(private router: Router) {}

  // Métodos de navegación alternativa (opcionales por si los usas por código)
  irAProgramacion(): void {
    this.router.navigate(['/app/programacion']);
  }

  irAIncidencias(): void {
    this.router.navigate(['/app/incidencias']);
  }

  // Redirección al login y limpieza de sesión
  logout(): void {
    console.log('Cerrando sesión...');
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/auth/login']);
  }
}