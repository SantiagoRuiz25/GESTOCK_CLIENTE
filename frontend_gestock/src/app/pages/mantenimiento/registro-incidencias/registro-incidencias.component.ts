import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro-incidencias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-incidencias.component.html',
  styleUrl: './registro-incidencias.component.css'
})
export class RegistroIncidenciasComponent {
  incidencias = [
    { id: 101, titulo: 'Fuga de aceite en sensor', prioridad: 'Alta', estado: 'Abierta', reportadoPor: 'Operador 1' },
    { id: 102, titulo: 'Fallo de encendido panel central', prioridad: 'Crítica', estado: 'En Revisión', reportadoPor: 'Operador 2' }
  ];

  nuevaIncidencia = {
    titulo: '',
    prioridad: 'Media',
    descripcion: ''
  };

  registrarIncidencia(): void {
    if (!this.nuevaIncidencia.titulo || !this.nuevaIncidencia.descripcion) {
      alert('Por favor describa la incidencia.');
      return;
    }

    this.incidencias.push({
      id: 100 + this.incidencias.length + 1,
      titulo: this.nuevaIncidencia.titulo,
      prioridad: this.nuevaIncidencia.prioridad,
      estado: 'Abierta',
      reportadoPor: 'Usuario Actual'
    });

    this.nuevaIncidencia = { titulo: '', prioridad: 'Media', descripcion: '' };
  }
}