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

  // Lista inicial por defecto en caso de que el localStorage esté vacío
  private productosIniciales: any[] = [
    { codigo: 'PROD-001', nombre: 'Laptop HP ProBook', categoria: 'Tecnología', bodega: 'Bodega Central', precio: 2500000, stock: 12 },
    { codigo: 'PROD-002', nombre: 'Mouse Inalámbrico Logitech', categoria: 'Accesorios', bodega: 'Bodega Norte', precio: 65000, stock: 45 },
    { codigo: 'PROD-003', nombre: 'Silla Ergonómica Ejecutiva', categoria: 'Mobiliario', bodega: 'Bodega Central', precio: 450000, stock: 8 },
    { codigo: 'PROD-004', nombre: 'Teclado Mecánico RGB', categoria: 'Accesorios', bodega: 'Bodega de Tránsito', precio: 180000, stock: 25 },
    { codigo: 'PROD-005', nombre: 'Monitor Dell 27 Pulgadas', categoria: 'Tecnología', bodega: 'Bodega Central', precio: 1200000, stock: 15 },
    { codigo: 'PROD-006', nombre: 'Impresora Multifuncional Epson', categoria: 'Tecnología', bodega: 'Bodega Norte', precio: 850000, stock: 10 },
    { codigo: 'PROD-007', nombre: 'Escritorio en L para Oficina', categoria: 'Mobiliario', bodega: 'Bodega Norte', precio: 650000, stock: 5 },
    { codigo: 'PROD-008', nombre: 'Audífonos con Cancelación de Ruido', categoria: 'Accesorios', bodega: 'Bodega de Tránsito', precio: 320000, stock: 30 },
    { codigo: 'PROD-009', nombre: 'Disco Duro Externo 1TB', categoria: 'Tecnología', bodega: 'Bodega Central', precio: 280000, stock: 22 },
    { codigo: 'PROD-010', nombre: 'Memoria USB 64GB Kingston', categoria: 'Accesorios', bodega: 'Bodega Central', precio: 35000, stock: 60 },
    { codigo: 'PROD-011', nombre: 'Cable HDMI 2 Metros', categoria: 'Accesorios', bodega: 'Bodega Norte', precio: 25000, stock: 50 },
    { codigo: 'PROD-012', nombre: 'Base Refrigerante para Laptop', categoria: 'Accesorios', bodega: 'Bodega de Tránsito', precio: 75000, stock: 18 },
    { codigo: 'PROD-013', nombre: 'Silla de Espera Fix', categoria: 'Mobiliario', bodega: 'Bodega Norte', precio: 190000, stock: 12 },
    { codigo: 'PROD-014', nombre: 'Archivador Metálico 4 Gavetas', categoria: 'Mobiliario', bodega: 'Bodega Central', precio: 720000, stock: 4 },
    { codigo: 'PROD-015', nombre: 'Router Wi-Fi Dual Band', categoria: 'Tecnología', bodega: 'Bodega de Tránsito', precio: 210000, stock: 14 },
    { codigo: 'PROD-016', nombre: 'Switch de Red 8 Puertos', categoria: 'Tecnología', bodega: 'Bodega Central', precio: 150000, stock: 20 },
    { codigo: 'PROD-017', nombre: 'Resma de Papel Carta x 500', categoria: 'Papelería', bodega: 'Bodega Central', precio: 22000, stock: 100 },
    { codigo: 'PROD-018', nombre: 'Bolígrafos Negros Caja x 50', categoria: 'Papelería', bodega: 'Bodega Norte', precio: 18000, stock: 80 },
    { codigo: 'PROD-019', nombre: 'Carpetas Colgantes Caja x 25', categoria: 'Papelería', bodega: 'Bodega de Tránsito', precio: 30000, stock: 40 },
    { codigo: 'PROD-020', nombre: 'Marcadores Borrables x 4', categoria: 'Papelería', bodega: 'Bodega Central', precio: 15000, stock: 55 },
    { codigo: 'PROD-021', nombre: 'Cafetera Eléctrica Industrial', categoria: 'Insumos', bodega: 'Bodega Norte', precio: 450000, stock: 3 },
    { codigo: 'PROD-022', nombre: 'Dispensador de Agua de Mesa', categoria: 'Insumos', bodega: 'Bodega Central', precio: 280000, stock: 6 },
    { codigo: 'PROD-023', nombre: 'Kit de Aseo General', categoria: 'Insumos', bodega: 'Bodega de Tránsito', precio: 95000, stock: 25 },
    { codigo: 'PROD-024', nombre: 'Gel Anti-bacterial Galón', categoria: 'Insumos', bodega: 'Bodega Central', precio: 45000, stock: 35 },
    { codigo: 'PROD-025', nombre: 'Toallas de Manos Despachador x 1000', categoria: 'Insumos', bodega: 'Bodega Norte', precio: 55000, stock: 40 },
    { codigo: 'PROD-026', nombre: 'Tablet Lenovo Tab M10', categoria: 'Tecnología', bodega: 'Bodega Central', precio: 780000, stock: 11 },
    { codigo: 'PROD-027', nombre: 'Smartphone Motorola Moto G', categoria: 'Tecnología', bodega: 'Bodega Norte', precio: 950000, stock: 9 },
    { codigo: 'PROD-028', nombre: 'Cámara Web Full HD 1080p', categoria: 'Accesorios', bodega: 'Bodega de Tránsito', precio: 160000, stock: 22 },
    { codigo: 'PROD-029', nombre: 'Micrófono USB para Streaming', categoria: 'Accesorios', bodega: 'Bodega Central', precio: 290000, stock: 7 },
    { codigo: 'PROD-030', nombre: 'Maletín Ejecutvo para Portátil', categoria: 'Accesorios', bodega: 'Bodega Norte', precio: 130000, stock: 16 },
    { codigo: 'PROD-031', nombre: 'Blanqueador Galón x 4', categoria: 'Insumos', bodega: 'Bodega de Tránsito', precio: 38000, stock: 20 },
    { codigo: 'PROD-032', nombre: 'Jabón Líquido Manos Galón', categoria: 'Insumos', bodega: 'Bodega Central', precio: 42000, stock: 25 },
    { codigo: 'PROD-033', nombre: 'Papel Higiénico Institucional Pack x 12', categoria: 'Insumos', bodega: 'Bodega Norte', precio: 62000, stock: 50 },
    { codigo: 'PROD-034', nombre: 'Estantería Metálica 5 Bandejas', categoria: 'Mobiliario', bodega: 'Bodega Central', precio: 310000, stock: 10 },
    { codigo: 'PROD-035', nombre: 'Mesa de Juntas 6 Puestos', categoria: 'Mobiliario', bodega: 'Bodega Norte', precio: 1400000, stock: 2 },
    { codigo: 'PROD-036', nombre: 'Bloc de Notas Adhesivas Post-it', categoria: 'Papelería', bodega: 'Bodega de Tránsito', precio: 12000, stock: 75 },
    { codigo: 'PROD-037', nombre: 'Grapadora de Oficina Metálica', categoria: 'Papelería', bodega: 'Bodega Central', precio: 24000, stock: 30 },
    { codigo: 'PROD-038', nombre: 'Perforadora de Papel Tres Huecos', categoria: 'Papelería', bodega: 'Bodega Norte', precio: 36000, stock: 15 },
    { codigo: 'PROD-039', nombre: 'Cinta Adhesiva Transparente Pack x 6', categoria: 'Papelería', bodega: 'Bodega de Tránsito', precio: 19000, stock: 40 },
    { codigo: 'PROD-040', nombre: 'Tijeras de Oficina Inoxidables', categoria: 'Papelería', bodega: 'Bodega Central', precio: 8500, stock: 50 },
    { codigo: 'PROD-041', nombre: 'Proyector Epson PowerLite', categoria: 'Tecnología', bodega: 'Bodega Central', precio: 2200000, stock: 4 },
    { codigo: 'PROD-042', nombre: 'Pantalla de Proyección Tripie', categoria: 'Tecnología', bodega: 'Bodega Norte', precio: 480000, stock: 6 },
    { codigo: 'PROD-043', nombre: 'Regleta Multitoma 6 Salidas', categoria: 'Accesorios', bodega: 'Bodega de Tránsito', precio: 45000, stock: 35 },
    { codigo: 'PROD-044', nombre: 'Adaptador USB-C a HDMI', categoria: 'Accesorios', bodega: 'Bodega Central', precio: 65000, stock: 28 },
    { codigo: 'PROD-045', nombre: 'Mousepad Ergonómico con Reposamuñecas', categoria: 'Accesorios', bodega: 'Bodega Norte', precio: 28000, stock: 42 },
    { codigo: 'PROD-046', nombre: 'Lámpara LED de Escritorio', categoria: 'Mobiliario', bodega: 'Bodega de Tránsito', precio: 95000, stock: 17 },
    { codigo: 'PROD-047', nombre: 'Papelera Metálica para Oficina', categoria: 'Mobiliario', bodega: 'Bodega Central', precio: 32000, stock: 25 },
    { codigo: 'PROD-048', nombre: 'Borrador de Tablero Acrílico', categoria: 'Papelería', bodega: 'Bodega Norte', precio: 6000, stock: 60 },
    { codigo: 'PROD-049', nombre: 'Calculadora Científica Casio', categoria: 'Tecnología', bodega: 'Bodega de Tránsito', precio: 85000, stock: 19 },
    { codigo: 'PROD-050', nombre: 'Caja Menor de Seguridad Portátil', categoria: 'Mobiliario', bodega: 'Bodega Central', precio: 125000, stock: 8 }
  ];

  // Getter que obtiene los productos directo del localStorage (sincronizado)
  get productosOriginales(): any[] {
    const datos = localStorage.getItem('inventario_productos');
    if (!datos) {
      // Si no existe, inicializamos el almacenamiento con los 50 por defecto
      localStorage.setItem('inventario_productos', JSON.stringify(this.productosIniciales));
      return this.productosIniciales;
    }
    return JSON.parse(datos);
  }

  filtroBusqueda: string = '';
  menuActivoIndex: number | null = null;
  productoEnEdicion: any = null;
  mensajeNotificacion: string | null = null;

  get productosFiltrados(): any[] {
    const lista = this.productosOriginales;
    if (!this.filtroBusqueda.trim()) {
      return lista;
    }
    const texto = this.filtroBusqueda.toLowerCase().trim();
    return lista.filter(p => 
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
      let lista = this.productosOriginales;
      const index = lista.findIndex(p => p.codigo === this.productoEnEdicion.codigo);
      if (index !== -1) {
        lista[index] = { ...this.productoEnEdicion };
        localStorage.setItem('inventario_productos', JSON.stringify(lista));
      }
      this.mostrarNotificacion('¡Producto actualizado correctamente!');
      this.cerrarModal();
    }
  }

  eliminarProducto(prod: any) {
    let lista = this.productosOriginales;
    lista = lista.filter(p => p.codigo !== prod.codigo);
    localStorage.setItem('inventario_productos', JSON.stringify(lista));
    
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