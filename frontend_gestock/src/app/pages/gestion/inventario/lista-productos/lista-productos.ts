import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-productos.html',
  styleUrls: ['./lista-productos.css']
})
export class ListaProductosComponent implements OnInit {

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
    { codigo: 'PROD-035', nombre: 'Mesa de Juntas 6 Puestos', categoria: 'Mobiliario', bodega: 'Bodega Norte', precio: 1400000, stock: 2 }
  ];

  productosOriginales: any[] = [];
  filtroBusqueda: string = '';
  menuActivoIndex: number | null = null;
  productoEnEdicion: any = null;
  private productoOriginalSnapshot: any = null;
  
  mensajeNotificacion: string | null = null;
  mensajeAlertaModal: string | null = null;
  productoAEliminar: any = null;

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    const datos = localStorage.getItem('inventario_productos');
    if (!datos) {
      localStorage.setItem('inventario_productos', JSON.stringify(this.productosIniciales));
      this.productosOriginales = [...this.productosIniciales];
    } else {
      try {
        this.productosOriginales = JSON.parse(datos);
      } catch (e) {
        this.productosOriginales = [...this.productosIniciales];
      }
    }
  }

  get categoriasDisponibles(): string[] {
    const categorias = this.productosOriginales.map(p => p.categoria);
    return Array.from(new Set(categorias)).sort();
  }

  get bodegasDisponibles(): string[] {
    const bodegas = this.productosOriginales.map(p => p.bodega);
    return Array.from(new Set(bodegas)).sort();
  }

  get productosFiltrados(): any[] {
    const lista = this.productosOriginales || [];
    if (!this.filtroBusqueda || !this.filtroBusqueda.trim()) {
      return lista;
    }
    const texto = this.filtroBusqueda.toLowerCase().trim();
    return lista.filter(p => 
      (p.nombre && p.nombre.toLowerCase().includes(texto)) ||
      (p.codigo && p.codigo.toLowerCase().includes(texto)) ||
      (p.categoria && p.categoria.toLowerCase().includes(texto)) ||
      (p.bodega && p.bodega.toLowerCase().includes(texto))
    );
  }

  abrirModalEditar(prod: any) {
    this.productoEnEdicion = { ...prod };
    this.productoOriginalSnapshot = { ...prod };
    this.mensajeAlertaModal = null;
    this.menuActivoIndex = null;
  }

  cerrarModal() {
    this.productoEnEdicion = null;
    this.productoOriginalSnapshot = null;
    this.mensajeAlertaModal = null;
  }

  registrarAuditoria(accion: 'CREAR' | 'ACTUALIZAR' | 'ELIMINAR', producto: any, usuario: string = 'Administrador') {
    const nuevoRegistro = {
      id: `#${Date.now().toString().slice(-3)}`,
      usuario: usuario,
      accion: accion,
      entidad: `Producto: ${producto.nombre}`,
      detalles: `Bodega: ${producto.bodega} | Cantidad: ${producto.stock} un.`,
      fechaHora: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
      estado: 'Completado'
    };

    const llaves = ['sistema_auditorias', 'auditorias'];
    llaves.forEach(key => {
      const actual = JSON.parse(localStorage.getItem(key) || '[]');
      actual.unshift(nuevoRegistro);
      localStorage.setItem(key, JSON.stringify(actual));
    });
  }

  guardarEdicion(form: any) {
    if (form.valid && this.productoEnEdicion) {
      const productoLimpio = {
        ...this.productoEnEdicion,
        precio: Number(this.productoEnEdicion.precio),
        stock: Number(this.productoEnEdicion.stock)
      };

      const indexReal = this.productosOriginales.findIndex(p => p.codigo === productoLimpio.codigo);
      
      if (indexReal !== -1 && this.productoOriginalSnapshot) {
        const sinCambios = pLinoCambio(productoLimpio, this.productoOriginalSnapshot);

        if (sinCambios) {
          this.cerrarModal();
          this.mensajeAlertaModal = 'No se realizaron modificaciones en el producto.';
          return; 
        }
      }

      if (indexReal !== -1) {
        this.productosOriginales[indexReal] = productoLimpio;
        this.registrarAuditoria('ACTUALIZAR', productoLimpio);
      } else {
        this.productosOriginales.unshift(productoLimpio);
        this.registrarAuditoria('CREAR', productoLimpio);
      }

      localStorage.setItem('inventario_productos', JSON.stringify(this.productosOriginales));
      console.log('✏️ [JSON Producto Modificado]:', JSON.stringify(productoLimpio, null, 2));
      
      this.productosOriginales = [...this.productosOriginales];
      this.cerrarModal();

      setTimeout(() => {
        this.mostrarNotificacion('¡Producto actualizado correctamente!');
      }, 100);
    }
  }

  confirmarEliminacion(prod: any) {
    this.productoAEliminar = prod;
    this.menuActivoIndex = null;
  }

  cancelarEliminacion() {
    this.productoAEliminar = null;
  }

  ejecutarEliminacion() {
    if (!this.productoAEliminar) return;

    const prod = this.productoAEliminar;
    console.log('🗑️ [JSON Producto Eliminado]:', JSON.stringify(prod, null, 2));

    this.productosOriginales = this.productosOriginales.filter(p => p.codigo !== prod.codigo);
    
    localStorage.setItem('inventario_productos', JSON.stringify(this.productosOriginales));
    this.productosOriginales = [...this.productosOriginales];
    
    this.registrarAuditoria('ELIMINAR', prod);

    this.productoAEliminar = null;

    setTimeout(() => {
      this.mostrarNotificacion('¡Producto eliminado del inventario con éxito!');
    }, 100);
  }

  mostrarNotificacion(mensaje: string) {
    this.mensajeNotificacion = null;
    setTimeout(() => {
      this.mensajeNotificacion = mensaje;
    }, 50);

    setTimeout(() => {
      if (this.mensajeNotificacion === mensaje) {
        this.mensajeNotificacion = null;
      }
    }, 3500);
  }
}

function pLinoCambio(p1: any, p2: any): boolean {
  return (
    p1.nombre === p2.nombre &&
    p1.categoria === p2.categoria &&
    p1.bodega === p2.bodega &&
    p1.precio === p2.precio &&
    p1.stock === p2.stock
  );
}