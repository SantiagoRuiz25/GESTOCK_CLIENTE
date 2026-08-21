import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-productos.html',
  styleUrls: ['./lista-productos.css']
})
export class ListaProductosComponent {
  // Lista original de productos
  productosOriginales: any[] = [
    { codigo: 'PROD-001', nombre: 'Laptop HP ProBook', categoria: 'Tecnología', bodega: 'Bodega Central', precio: 2500000, stock: 12 },
    { codigo: 'PROD-002', nombre: 'Mouse Inalámbrico Logitech', categoria: 'Accesorios', bodega: 'Bodega Norte', precio: 65000, stock: 45 },
    { codigo: 'PROD-003', nombre: 'Silla Ergonómica Ejecutiva', categoria: 'Mobiliario', bodega: 'Bodega Central', precio: 450000, stock: 8 },
    { codigo: 'PROD-004', nombre: 'Teclado Mecánico RGB', categoria: 'Accesorios', bodega: 'Bodega de Tránsito', precio: 180000, stock: 25 }
  ];

  filtroBusqueda: string = '';
  menuActivoIndex: number | null = null;
  productoEnEdicion: any = null;
  mensajeNotificacion: string | null = null;

  // Propiedad computada o getter para filtrar en tiempo real
  get productosFiltrados(): any[] {
    if (!this.filtroBusqueda.trim()) {
      return this.productosOriginales;
    }
    const texto = this.filtroBusqueda.toLowerCase().trim();
    return this.productosOriginales.filter(p => 
      p.nombre.toLowerCase().includes(texto) ||
      p.codigo.toLowerCase().includes(texto) ||
      p.categoria.toLowerCase().includes(texto) ||
      p.bodega.toLowerCase().includes(texto)
    );
  }

  toggleMenu(index: number) {
    this.menuActivoIndex = this.menuActivoIndex === index ? null : index;
  }

  abrirModalEditar(prod: any) {
    this.productoEnEdicion = { ...prod };
    this.menuActivoIndex = null;
  }

  cerrarModal() {
    this.productoEnEdicion = null;
  }

  guardarEdicion(form: any) {
    if (form.valid) {
      const index = this.productosOriginales.findIndex(p => p.codigo === this.productoEnEdicion.codigo);
      if (index !== -1) {
        this.productosOriginales[index] = { ...this.productoEnEdicion };
      }
      this.mostrarNotificacion('¡Producto actualizado correctamente en el inventario!');
      this.cerrarModal();
    }
  }

  eliminarProducto(prod: any) {
    this.productosOriginales = this.productosOriginales.filter(p => p.codigo !== prod.codigo);
    this.menuActivoIndex = null;
    this.mostrarNotificacion('¡Producto eliminado del inventario con éxito!');
  }

  mostrarNotificacion(mensaje: string) {
    this.mensajeNotificacion = mensaje;
    setTimeout(() => {
      this.mensajeNotificacion = null;
    }, 3500);
  }
}