import { Component, OnInit, inject, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth';

interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  tiempo: string;
  leida: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);

  usuarioActual: Usuario | null = null;
  mostrarMenuPerfil: boolean = false;
  mostrarNotificaciones: boolean = false;

  notificaciones: Notificacion[] = [
    {
      id: 1,
      titulo: 'Stock Bajo',
      mensaje: 'El producto Sensor LDR tiene 3 unidades.',
      tiempo: 'Hace 5 min',
      leida: false
    }
  ];

  ngOnInit(): void {
    this.cargarUsuario();
  }

  cargarUsuario(): void {
    this.usuarioActual = this.authService.obtenerUsuarioActual();
  }

  obtenerIniciales(): string {
    if (!this.usuarioActual || !this.usuarioActual.nombre) {
      return 'AG';
    }
    const partes = this.usuarioActual.nombre.trim().split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return partes[0].slice(0, 2).toUpperCase();
  }

  toggleMenuPerfil(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.mostrarMenuPerfil = !this.mostrarMenuPerfil;
    if (this.mostrarMenuPerfil) {
      this.mostrarNotificaciones = false;
    }
    this.cdr.detectChanges();
  }

  toggleNotificaciones(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    if (this.mostrarNotificaciones) {
      this.mostrarMenuPerfil = false;
    }
    this.cdr.detectChanges();
  }

  cerrarMenus(): void {
    this.mostrarMenuPerfil = false;
    this.mostrarNotificaciones = false;
    this.cdr.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.cerrarMenus();
    }
  }

  marcarTodasComoLeidas(): void {
    this.notificaciones.forEach(n => n.leida = true);
  }

  obtenerSinLeerCount(): number {
    return this.notificaciones.filter(n => !n.leida).length;
  }

  cerrarSesion(): void {
    this.cerrarMenus();
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}