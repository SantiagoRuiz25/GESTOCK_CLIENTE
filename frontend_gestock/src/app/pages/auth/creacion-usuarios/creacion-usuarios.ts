import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Importaciones añadidas

@Component({
  selector: 'app-creacion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule], // RouterLink añadido a los imports
  templateUrl: './creacion-usuarios.html',
  styleUrl: './creacion-usuarios.css'
})
export class CreacionUsuariosComponent {

  pasoActual: number = 1; // 1: Registro de datos, 2: Código de verificación
  codigoVerificacion: string = '';

  nuevoUsuario = {
    nombre: '',
    correo: '',
    password: '',
    rol: 'Operador'
  };

  roles = ['Administrador', 'Operador', 'Técnico de Mantenimiento', 'Auditor'];

  constructor(private router: Router) {}

  solicitarRegistro(): void {
    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.correo || !this.nuevoUsuario.password) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }
    // Simulación del envío de código de verificación (HU004)
    this.pasoActual = 2;
  }

  confirmarCodigo(): void {
    if (this.codigoVerificacion.length !== 6) {
      alert('Ingrese un código válido de 6 dígitos.');
      return;
    }

    alert(`Usuario ${this.nuevoUsuario.nombre} registrado con éxito con el rol: ${this.nuevoUsuario.rol}`);
    
    // Limpieza de estado local
    this.pasoActual = 1;
    this.nuevoUsuario = { nombre: '', correo: '', password: '', rol: 'Operador' };
    this.codigoVerificacion = '';

    // Redirección al login para iniciar sesión
    this.router.navigate(['/auth/login']);
  }
}