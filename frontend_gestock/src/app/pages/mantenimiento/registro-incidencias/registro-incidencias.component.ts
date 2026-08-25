import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface IncidenciaItem {
  id: string;
  titulo: string;
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  descripcion: string;
  reportadoPor: string;
  estado: 'En Revisión' | 'Pendiente' | 'Resuelto';
  fecha: string;
}

@Component({
  selector: 'app-incidencias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-incidencias.component.html',
  styleUrls: ['./registro-incidencias.component.css']
})
export class IncidenciasComponent implements OnInit {

  listaIncidencias: IncidenciaItem[] = [];

  nuevaIncidencia: IncidenciaItem = {
    id: '',
    titulo: '',
    prioridad: 'Media',
    descripcion: '',
    reportadoPor: 'Maicol Nore',
    estado: 'En Revisión',
    fecha: ''
  };

  ngOnInit() {
    const guardados = localStorage.getItem('gestock_incidencias');
    if (guardados) {
      try {
        this.listaIncidencias = JSON.parse(guardados);
      } catch (e) {
        console.error('Error al cargar incidencias del localStorage', e);
        this.cargarDatosIniciales();
      }
    } else {
      this.cargarDatosIniciales();
    }
  }

  cargarDatosIniciales() {
    this.listaIncidencias = [
      {
        id: '#101',
        titulo: 'Fuga de aceite en sensor',
        prioridad: 'Alta',
        descripcion: 'Se detectó pérdida de fluido hidráulico cerca del sensor principal de la línea 2.',
        reportadoPor: 'Operador 1',
        estado: 'En Revisión',
        fecha: '2026-08-25 09:30'
      },
      {
        id: '#102',
        titulo: 'Fallo de encendido panel central',
        prioridad: 'Crítica',
        descripcion: 'El tablero de control principal no responde al suministro auxiliar de energía.',
        reportadoPor: 'Operador 2',
        estado: 'Pendiente',
        fecha: '2026-08-25 10:15'
      }
    ];
    this.sincronizarStorage();
  }

  sincronizarStorage() {
    localStorage.setItem('gestock_incidencias', JSON.stringify(this.listaIncidencias));
  }

  guardarIncidencia() {
    if (!this.nuevaIncidencia.titulo || !this.nuevaIncidencia.descripcion) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }

    const ahora = new Date();
    const idNum = 100 + this.listaIncidencias.length + 1;

    this.nuevaIncidencia.id = `#${idNum}`;
    this.nuevaIncidencia.fecha = ahora.toISOString().slice(0, 10) + ' ' + ahora.toTimeString().slice(0, 5);

    // Agregar al inicio de la lista
    this.listaIncidencias.unshift({ ...this.nuevaIncidencia });

    // Guardar temporalmente en localStorage
    this.sincronizarStorage();

    // Mostrar JSON exacto en la consola de desarrollo de manera limpia
    console.log('%c[GESTOCK] Nueva Incidencia Registrada (JSON):', 'color: #f97316; font-weight: bold;');
    console.log(JSON.stringify(this.nuevaIncidencia, null, 2));

    // Resetear formulario con valores base
    this.nuevaIncidencia = {
      id: '',
      titulo: '',
      prioridad: 'Media',
      descripcion: '',
      reportadoPor: 'Maicol Nore',
      estado: 'En Revisión',
      fecha: ''
    };
  }
}