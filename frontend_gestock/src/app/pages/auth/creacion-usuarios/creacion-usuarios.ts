import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RolUsuario } from '../../../services/auth';

@Component({
  selector: 'app-creacion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './creacion-usuarios.html',
  styleUrl: './creacion-usuarios.css'
})
export class CreacionUsuariosComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  pasoActual: number = 1;
  codigoVerificacion: string = '';
  codigoCorrecto: string = '123456';
  errorMessage: string = '';

  nuevoUsuario = {
    nombre: 'erick',
    correo: 'operador@gmail.com',
    password: '12345678',
    rol: 'Operador'
  };

  roles = ['Administrador', 'Operador', 'Técnico de Mantenimiento', 'Auditor'];

  private mapaRoles: Record<string, RolUsuario> = {
    'Administrador': 'Administrador',
    'Operador': 'Operario',
    'Técnico de Mantenimiento': 'Supervisor',
    'Auditor': 'Auditor'
  };

  // Método requerido por (ngSubmit)="solicitarRegistro()" en el HTML
  solicitarRegistro(): void {
    this.errorMessage = '';

    if (!this.nuevoUsuario.correo || !this.nuevoUsuario.password || !this.nuevoUsuario.nombre) {
      this.errorMessage = '⚠️ Todos los campos son obligatorios.';
      return;
    }

    if (this.nuevoUsuario.password.length < 3) {
      this.errorMessage = '⚠️ La contraseña debe tener al menos 3 caracteres.';
      return;
    }

    // Pasa al paso 2 (Ingreso del código 2FA)
    this.pasoActual = 2;
  }

  // Método requerido por (click)="confirmarCodigo()" en el HTML
  confirmarCodigo(): void {
    this.errorMessage = '';

    if (this.codigoVerificacion.trim() !== this.codigoCorrecto) {
      this.errorMessage = '⚠️ Código de verificación incorrecto. Usa 123456.';
      return;
    }

    const rolMapeado = this.mapaRoles[this.nuevoUsuario.rol] || 'Operario';

    const exito = this.authService.registrar({
      nombre: this.nuevoUsuario.nombre,
      email: this.nuevoUsuario.correo,
      password: this.nuevoUsuario.password,
      rol: rolMapeado
    });

    if (exito) {
      this.router.navigate(['/auth/login']);
    } else {
      this.pasoActual = 1;
      this.errorMessage = '⚠️ El correo electrónico ya se encuentra registrado.';
    }
  }
}