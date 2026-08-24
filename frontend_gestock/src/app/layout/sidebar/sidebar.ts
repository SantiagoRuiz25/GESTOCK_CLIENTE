import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
<<<<<<< Updated upstream
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
=======
import { RouterModule, Router } from '@angular/router';
>>>>>>> Stashed changes

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {

  constructor(private router: Router) {}

<<<<<<< Updated upstream
  // Métodos de navegación alternativa (opcionales por si los usas por código)
  irAProgramacion(): void {
    this.router.navigate(['/app/programacion']);
  }

  irAIncidencias(): void {
    this.router.navigate(['/app/incidencias']);
  }

  // Redirección al login y limpieza de sesión
  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/auth/login']);
=======
  // Método para cerrar sesión y redirigir al login
  cerrarSesion(): void {
    console.log('Cerrando sesión...');
    
    // Si manejas tokens en localStorage o sessionStorage, los limpias aquí:
    localStorage.clear();
    sessionStorage.clear();

    // Redirige a la pantalla de login (ajusta la ruta según tu proyecto)
    this.router.navigate(['/login']);
>>>>>>> Stashed changes
  }
}