import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recuperacion-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recuperacion-contrasena.html',
  styleUrl: './recuperacion-contrasena.css'
})
export class RecuperacionContrasenaComponent {
  @ViewChild('cardRef') cardRef!: ElementRef<HTMLDivElement>;

  // Control de Flujo: 1 = Solicitar Correo (HU005), 2 = Validar Código (HU006), 3 = Crear Nueva Contraseña (HU007)
  pasoActual: number = 1;
  isLoading: boolean = false;
  activeField: string | null = null;

  datosRecuperacion = {
    correo: '',
    codigo: '',
    nuevaPassword: '',
    confirmarPassword: ''
  };

  // Efecto Tilt 3D e iluminación dinámica
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.cardRef) return;
    const card = this.cardRef.nativeElement;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    card.style.setProperty('--rotate-x', `${rotateX}deg`);
    card.style.setProperty('--rotate-y', `${rotateY}deg`);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (!this.cardRef) return;
    const card = this.cardRef.nativeElement;
    card.style.setProperty('--rotate-x', `0deg`);
    card.style.setProperty('--rotate-y', `0deg`);
  }

  setFocus(field: string): void {
    this.activeField = field;
  }

  clearFocus(): void {
    this.activeField = null;
  }

  // HU005: Solicitar recuperación
  solicitarRecuperacion(): void {
    if (!this.datosRecuperacion.correo) {
      alert('Por favor, ingresa un correo electrónico válido.');
      return;
    }
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.pasoActual = 2;
    }, 1200);
  }

  // HU006: Validar código enviado
  validarCodigo(): void {
    if (this.datosRecuperacion.codigo.length !== 6) {
      alert('Ingresa un código de 6 dígitos.');
      return;
    }
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.pasoActual = 3;
    }, 1200);
  }

  // HU007: Crear nueva contraseña
  guardarNuevaPassword(): void {
    if (!this.datosRecuperacion.nuevaPassword || !this.datosRecuperacion.confirmarPassword) {
      alert('Completa los campos de contraseña.');
      return;
    }
    if (this.datosRecuperacion.nuevaPassword !== this.datosRecuperacion.confirmarPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      alert('¡Contraseña restablecida con éxito!');
      this.pasoActual = 1;
      this.datosRecuperacion = { correo: '', codigo: '', nuevaPassword: '', confirmarPassword: '' };
    }, 1500);
  }
}