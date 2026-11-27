import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Sesion {
  id: string;
  dispositivo: string;
  navegador: string;
  ubicacion: string;
  ip: string;
  ultimaActividad: string;
  esActual: boolean;
}

interface Alerta {
  id: string;
  mensaje: string;
  fecha: string;
  ubicacion: string;
  ip: string;
}

@Component({
  selector: 'app-sesiones-activas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sesiones-activas.html',
  styleUrl: './sesiones-activas.css'
})
export class SesionesActivasComponent {
  @ViewChild('cardRef') cardRef!: ElementRef<HTMLDivElement>;

  // Simulación de rol de administrador (HU011 - Restricción)
  esAdmin: boolean = true; 

  // HU011: Visualización de sesiones activas
  sesiones: Sesion[] = [
    {
      id: 'sess-01',
      dispositivo: 'MacBook Pro 16"',
      navegador: 'Chrome v128',
      ubicacion: 'Yopal, Colombia',
      ip: '181.135.22.10',
      ultimaActividad: 'Hace un momento',
      esActual: true
    },
    {
      id: 'sess-02',
      dispositivo: 'iPhone 15 Pro',
      navegador: 'Safari Mobile',
      ubicacion: 'Bogotá, Colombia',
      ip: '190.28.44.112',
      ultimaActividad: 'Hace 15 minutos',
      esActual: false
    },
    {
      id: 'sess-03',
      dispositivo: 'Windows PC (Tractomula Depot)',
      navegador: 'Edge v126',
      ubicacion: 'Santa Marta, Colombia',
      ip: '186.112.80.05',
      ultimaActividad: 'Hace 2 horas',
      esActual: false
    }
  ];

  // HU013: Notificaciones de inicio de sesión inusual
  alertas: Alerta[] = [
    {
      id: 'alt-01',
      mensaje: 'Acceso desde un dispositivo nuevo no reconocido',
      fecha: 'Ayer, 22:45',
      ubicacion: 'Medellín, Colombia',
      ip: '190.157.10.88'
    }
  ];

  // Interacción 3D y seguimiento del cursor
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.cardRef) return;
    const card = this.cardRef.nativeElement;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  }

  // HU012: Cierre de sesión individual
  cerrarSesion(id: string): void {
    this.sesiones = this.sesiones.filter(s => s.id !== id);
    alert('Sesión finalizada exitosamente.');
  }

  // HU012: Cierre de todas las demás sesiones
  cerrarTodasLasDemas(): void {
    this.sesiones = this.sesiones.filter(s => s.esActual);
    alert('Se han cerrado todas las sesiones remotas.');
  }

  descartarAlerta(id: string): void {
    this.alertas = this.alertas.filter(a => a.id !== id);
  }
}