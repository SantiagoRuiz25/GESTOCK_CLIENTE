import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  // Estado para mostrar u ocultar el menú desplegable del perfil
  mostrarMenuPerfil: boolean = false;

  constructor(private router: Router) {}

  // Método para alternar el menú al hacer clic en el perfil
  toggleMenuPerfil(): void {
    this.mostrarMenuPerfil = !this.mostrarMenuPerfil;
  }

  // Cierra el menú automáticamente si se hace clic fuera de él
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile-container')) {
      this.mostrarMenuPerfil = false;
    }
  }

  // Acción para cerrar sesión
  cerrarSesion(): void {
    this.mostrarMenuPerfil = false;
    localStorage.removeItem('gestock_session');
    console.log('%c[GESTOCK] Sesión cerrada.', 'color: #f59e0b; font-weight: bold;');
    this.router.navigate(['/auth/login']);
  }
}