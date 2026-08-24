import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

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

  // Carga las 15 bodegas desde el localStorage, o las inicializa desactivadas por defecto
  private obtenerBodegasIniciales(): any[] {
    const guardadas = localStorage.getItem('inventario_bodegas');
    if (guardadas) {
      return JSON.parse(guardadas);
    }

    const listaInicial = [
      { id: 1, nombre: 'Bodega Principal Yopal', codigo: 'BOD-001', direccion: 'Calle 24 # 15-40', ciudad: 'Yopal', icono: '🏢', responsable: 'Carlos Pérez', telefono: '3101234567', ocupado: 8500, capacidad: 10000, activa: false },
      { id: 2, nombre: 'Centro Logístico Medellín', codigo: 'BOD-002', direccion: 'Cra. 50 # 12-30', ciudad: 'Medellín', icono: '🏭', responsable: 'Ana Gómez', telefono: '3209876543', ocupado: 3200, capacidad: 8000, activa: false },
      { id: 3, nombre: 'Bodega de Tránsito Cali', codigo: 'BOD-003', direccion: 'Calle 15 # 32-10', ciudad: 'Cali', icono: '📦', responsable: 'Luis Rodríguez', telefono: '3154567890', ocupado: 4500, capacidad: 5000, activa: false },
      { id: 4, nombre: 'Depósito Bogotá Norte', codigo: 'BOD-004', direccion: 'Autopista Norte # 180-20', ciudad: 'Bogotá', icono: '🏗️', responsable: 'Andrea Gómez', telefono: '3201112233', ocupado: 24000, capacidad: 30000, activa: false },
      { id: 5, nombre: 'Bodega Costa Caribe', codigo: 'BOD-005', direccion: 'Vía 40 # 73-100', ciudad: 'Barranquilla', icono: '⚓', responsable: 'Jorge Díaz', telefono: '3014433221', ocupado: 23000, capacidad: 25000, activa: false },
      { id: 6, nombre: 'Punto Villavicencio', codigo: 'BOD-006', direccion: 'Anillo Vial # 4-50', ciudad: 'Villavicencio', icono: '🚚', responsable: 'Lucía Benítez', telefono: '3125566778', ocupado: 4500, capacidad: 12000, activa: false },
      { id: 7, nombre: 'Bodega Eje Cafetero', codigo: 'BOD-007', direccion: 'Km 3 Vía Armenia', ciudad: 'Pereira', icono: '☕', responsable: 'Esteban Osorio', telefono: '3149988776', ocupado: 8200, capacidad: 10000, activa: false },
      { id: 8, nombre: 'Centro Acopio Bucaramanga', codigo: 'BOD-008', direccion: 'Cra. 27 # 52-14', ciudad: 'Bucaramanga', icono: '📦', responsable: 'Tatiana Rueda', telefono: '3112233445', ocupado: 11000, capacidad: 14000, activa: false },
      { id: 9, nombre: 'Bodega Nororiente Cúcuta', codigo: 'BOD-009', direccion: 'Av. Libertadores # 8-30', ciudad: 'Cúcuta', icono: '🏢', responsable: 'Ricardo Quintero', telefono: '3186655443', ocupado: 15200, capacidad: 16000, activa: false },
      { id: 10, nombre: 'Terminal Logística Cartagena', codigo: 'BOD-010', direccion: 'Zona Industrial Mamonal Km 7', ciudad: 'Cartagena', icono: '🚢', responsable: 'Héctor Pájaro', telefono: '3167788991', ocupado: 18000, capacidad: 35000, activa: false },
      { id: 11, nombre: 'Bodega Sur Neiva', codigo: 'BOD-011', direccion: 'Calle 8 # 25-12', ciudad: 'Neiva', icono: '📦', responsable: 'Claudia Perdomo', telefono: '3190011223', ocupado: 3200, capacidad: 9000, activa: false },
      { id: 12, nombre: 'Almacén Manizales Centro', codigo: 'BOD-012', direccion: 'Cra. 23 # 20-45', ciudad: 'Manizales', icono: '🏭', responsable: 'Julián Giraldo', telefono: '3134455667', ocupado: 9500, capacidad: 11000, activa: false },
      { id: 13, nombre: 'Bodega Llanos Paz de Ariporo', codigo: 'BOD-013', direccion: 'Calle Principal # 5-20', ciudad: 'Paz de Ariporo', icono: '🌾', responsable: 'Diana Silva', telefono: '3213344556', ocupado: 2100, capacidad: 8000, activa: false },
      { id: 14, nombre: 'Centro Operativo Santa Marta', codigo: 'BOD-014', direccion: 'Av. del Ferrocarril # 22-10', ciudad: 'Santa Marta', icono: '🏖️', responsable: 'Alberto Vives', telefono: '3109988772', ocupado: 12100, capacidad: 13000, activa: false },
      { id: 15, nombre: 'Depósito Pasto Andina', codigo: 'BOD-015', direccion: 'Panamericana # 18-05', ciudad: 'Pasto', icono: '⛰️', responsable: 'Sandra Jojoa', telefono: '3151122334', ocupado: 4000, capacidad: 10000, activa: false }
    ];

    localStorage.setItem('inventario_bodegas', JSON.stringify(listaInicial));
    return listaInicial;
  }

  bodegas = signal<any[]>(this.obtenerBodegasIniciales());

  nuevaBodega = {
    nombre: '',
    codigo: '',
    direccion: '',
    ciudad: '',
    telefono: '',
    responsable: '',
    capacidad: null
  };

  getPorcentaje(ocupado: number, capacidad: number): number {
    if (!capacidad || capacidad <= 0) return 0;
    return Math.round((ocupado / capacidad) * 100);
  }

  toggleEstado(id: number): void {
    this.bodegas.update(lista => {
      const nuevaLista = lista.map(b => b.id === id ? { ...b, activa: !b.activa } : b);
      localStorage.setItem('inventario_bodegas', JSON.stringify(nuevaLista));
      return nuevaLista;
    });
  }

  // Método para registrar la nueva bodega de manera funcional
  crearBodega(form: NgForm): void {
    if (form.invalid) return;

    const nueva = {
      id: Date.now(),
      nombre: this.nuevaBodega.nombre,
      codigo: this.nuevaBodega.codigo || `BOD-${Math.floor(100 + Math.random() * 900)}`,
      direccion: this.nuevaBodega.direccion,
      ciudad: this.nuevaBodega.ciudad,
      icono: '📦',
      responsable: this.nuevaBodega.responsable,
      telefono: this.nuevaBodega.telefono,
      ocupado: 0,
      capacidad: Number(this.nuevaBodega.capacidad),
      activa: false // Se mantiene desactivada hasta que el usuario decida activarla
    };

    this.bodegas.update(lista => {
      const listaActualizada = [...lista, nueva];
      localStorage.setItem('inventario_bodegas', JSON.stringify(listaActualizada));
      return listaActualizada;
    });

    form.resetForm();
    this.mostrarModal.set(false);
  }
}