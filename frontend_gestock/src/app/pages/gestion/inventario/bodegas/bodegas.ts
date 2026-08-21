import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bodegas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bodegas.html',
  styleUrls: ['./bodegas.css']
})
export class BodegasComponent {
  // Control de visibilidad del modal con Signal
  mostrarModal = signal<boolean>(false);

  // Lista de bodegas reactiva con Signal
  bodegas = signal<any[]>([
    {
      id: 1,
      nombre: 'Bodega Central',
      codigo: 'BOD-001',
      ciudad: 'Bogotá',
      icono: '🏢',
      responsable: 'Carlos Pérez',
      telefono: '3101234567',
      ocupado: 8500,
      capacidad: 10000,
      activa: true
    },
    {
      id: 2,
      nombre: 'Bodega Norte',
      codigo: 'BOD-002',
      ciudad: 'Medellín',
      icono: '🏭',
      responsable: 'Ana Gómez',
      telefono: '3209876543',
      ocupado: 3200,
      capacidad: 8000,
      activa: true
    },
    {
      id: 3,
      nombre: 'Bodega de Tránsito',
      codigo: 'BOD-003',
      ciudad: 'Cali',
      icono: '📦',
      responsable: 'Luis Rodríguez',
      telefono: '3154567890',
      ocupado: 4500,
      capacidad: 5000,
      activa: false
    }
  ]);

  // Objeto para el formulario de nueva bodega
  nuevaBodega = {
    nombre: '',
    codigo: '',
    direccion: '',
    ciudad: '',
    telefono: '',
    responsable: '',
    capacidad: null
  };

  // Método para calcular el porcentaje de ocupación
  getPorcentaje(ocupado: number, capacidad: number): number {
    if (!capacidad || capacidad <= 0) return 0;
    return Math.round((ocupado / capacidad) * 100);
  }

  // Método para alternar el estado activo/inactivo
  toggleEstado(id: number): void {
    this.bodegas.update(lista => 
      lista.map(b => b.id === id ? { ...b, activa: !b.activa } : b)
    );
  }

  // Método para crear una nueva bodega desde el formulario
  crearBodega(): void {
    if (!this.nuevaBodega.nombre || !this.nuevaBodega.capacidad) return;

    const nueva = {
      id: Date.now(),
      nombre: this.nuevaBodega.nombre,
      codigo: this.nuevaBodega.codigo,
      ciudad: this.nuevaBodega.ciudad,
      icono: '📦',
      responsable: this.nuevaBodega.responsable,
      telefono: this.nuevaBodega.telefono,
      ocupado: 0, // Inicia vacía
      capacidad: Number(this.nuevaBodega.capacidad),
      activa: true
    };

    // Actualizamos la Signal agregando la nueva bodega
    this.bodegas.update(lista => [...lista, nueva]);

    // Reseteamos el formulario y cerramos el modal
    this.nuevaBodega = { nombre: '', codigo: '', direccion: '', ciudad: '', telefono: '', responsable: '', capacidad: null };
    this.mostrarModal.set(false);
  }
}