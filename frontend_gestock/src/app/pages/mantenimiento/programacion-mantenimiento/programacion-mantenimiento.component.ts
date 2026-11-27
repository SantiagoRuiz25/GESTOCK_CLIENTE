import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Mantenimiento {
  id: number;
  equipo: string;
  tipo: string;
  fecha: string;
  estado: string;
}

@Component({
  selector: 'app-programacion-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule], // Importantes para *ngFor, [ngClass] y [(ngModel)]
  templateUrl: './programacion-mantenimiento.component.html',
  styleUrl: './programacion-mantenimiento.component.css',
})
export class ProgramacionMantenimientoComponent {

  // Modelo del formulario
  nuevoMantenimiento = {
    equipo: '',
    tipo: 'Preventivo',
    fecha: ''
  };

  // Datos de prueba para la tabla
  programaciones: Mantenimiento[] = [
    { id: 101, equipo: 'Montacargas #1', tipo: 'Preventivo', fecha: '2026-08-25', estado: 'Pendiente' },
    { id: 102, equipo: 'Banda Transportadora B', tipo: 'Correctivo', fecha: '2026-08-22', estado: 'En Proceso' },
    { id: 103, equipo: 'Generador Principal', tipo: 'Predictivo', fecha: '2026-08-20', estado: 'Completado' }
  ];

  // Función para procesar el formulario
  guardarProgramacion(): void {
    if (!this.nuevoMantenimiento.equipo || !this.nuevoMantenimiento.fecha) return;

    const nuevoItem: Mantenimiento = {
      id: this.programaciones.length + 101,
      equipo: this.nuevoMantenimiento.equipo,
      tipo: this.nuevoMantenimiento.tipo,
      fecha: this.nuevoMantenimiento.fecha,
      estado: 'Pendiente'
    };

    // Agregar a la tabla y reiniciar el formulario
    this.programaciones.unshift(nuevoItem);
    
    // [MODIFICACIÓN GESTOCK] - Registro detallado en consola con formato JSON
    console.log('%c[GESTOCK] Nuevo Mantenimiento Registrado (JSON):', 'color: #38bdf8; font-weight: bold;');
    console.log(JSON.stringify(nuevoItem, null, 2));

    this.nuevoMantenimiento = {
      equipo: '',
      tipo: 'Preventivo',
      fecha: ''
    };
  }
}