import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RecepcionItem {
  id: string;
  producto: string;
  cantidad: number;
  proveedor: string;
  estado: 'Validado' | 'Discrepancia';
}

@Component({
  selector: 'app-recepcion-mercancias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recepcion-mercancias.html',
  styleUrls: ['./recepcion-mercancias.css']
})
export class RecepcionMercanciasComponent {
  
  // Estado para controlar el modal de registro (HU035)
  isModalOpen: boolean = false;

  // Formulario reactivo básico para nueva entrada
  nuevaRecepcion = {
    orden: '',
    producto: '',
    cantidad: 1,
    proveedor: '',
    estado: 'Validado' as 'Validado' | 'Discrepancia'
  };

  // Lista de recepciones registradas (HU035 / HU036)
  listaRecepciones: RecepcionItem[] = [
    { id: 'OC-2026-891', producto: 'Disco Duro Externo 1TB', cantidad: 50, proveedor: 'TecnoLogistics S.A.S.', estado: 'Validado' },
    { id: 'OC-2026-892', producto: 'Mouse Inalámbrico Logitech', cantidad: 120, proveedor: 'Global Distribuciones', estado: 'Discrepancia' }
  ];

  abrirModalRegistro(): void {
    this.isModalOpen = true;
  }

  cerrarModalRegistro(): void {
    this.isModalOpen = false;
    this.nuevaRecepcion = { orden: '', producto: '', cantidad: 1, proveedor: '', estado: 'Validado' };
  }

  registrarEntrada(): void {
    if (!this.nuevaRecepcion.orden || !this.nuevaRecepcion.producto) return;

    this.listaRecepciones.unshift({
      id: this.nuevaRecepcion.orden,
      producto: this.nuevaRecepcion.producto,
      cantidad: Number(this.nuevaRecepcion.cantidad),
      proveedor: this.nuevaRecepcion.proveedor,
      estado: this.nuevaRecepcion.estado
    });

    this.cerrarModalRegistro();
  }

  // Generar informe de recepción (HU037)
  generarInforme(item: RecepcionItem): void {
    alert(`Generando informe de recepción para la orden: ${item.id} - Producto: ${item.producto}`);
  }
}