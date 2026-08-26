import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
    { codigo: 'PROD-003', nombre: 'Silla Ergonómica Ejecutiva', categoria: 'Mobiliario', bodega: 'Bodega Central', precio: 450000, stock: 8 }
  ];

  productosOriginales: any[] = [];
  filtroBusqueda: string = '';
  menuActivoIndex: number | null = null;
  productoEnEdicion: any = null;
  private productoOriginalSnapshot: any = null;
  
  mensajeNotificacion: string | null = null;
  mensajeAlertaModal: string | null = null;
  productoAEliminar: any = null;

  // Inyectamos ChangeDetectorRef para forzar el renderizado inmediato en pantalla
  constructor(private cdRef: ChangeDetectorRef) {}

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
    document.body.style.overflow = 'hidden';
  }

  cerrarModal() {
    this.productoEnEdicion = null;
    this.productoOriginalSnapshot = null;
    this.mensajeAlertaModal = null;
    document.body.style.overflow = 'auto';
  }

  registrarAuditoria(accion: 'CREAR' | 'ACTUALIZAR' | 'ELIMINAR', producto: any, usuario: string = 'Administrador') {
    const nuevoRegistro = {
      id: `#${Date.now().toString().slice(-3)}`,
      usuario: usuario,
      accion: accion,
      entidad: `Producto: ${producto.nombre}`,
      detalles: `Bodega: ${producto.bodega} | Cantidad: ${producto.stock} un.`,
      fechaHora: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
      estado: 'Completado',
      jsonDetalle: producto
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
        if (verificarSinCambios(productoLimpio, this.productoOriginalSnapshot)) {
          this.cerrarModal();
          this.mensajeAlertaModal = 'No se realizaron modificaciones en el producto.';
          return; 
        }
      }

      if (indexReal !== -1) {
        this.productosOriginales[indexReal] = productoLimpio;
        this.registrarAuditoria('ACTUALIZAR', productoLimpio);

        console.group(`✏️ PRODUCTO ACTUALIZADO [ ACCIÓN: ACTUALIZAR ]`);
        console.log('Datos Anteriores:', this.productoOriginalSnapshot);
        console.log('Datos Nuevos (Modificados):', productoLimpio);
        console.log('=== JSON COMPLETO ===');
        console.log(JSON.stringify(productoLimpio, null, 2));
        console.groupEnd();

      } else {
        this.productosOriginales.unshift(productoLimpio);
        this.registrarAuditoria('CREAR', productoLimpio);

        console.group(`✨ PRODUCTO CREADO [ ACCIÓN: CREAR ]`);
        console.log('=== JSON COMPLETO ===');
        console.log(JSON.stringify(productoLimpio, null, 2));
        console.groupEnd();
      }

      localStorage.setItem('inventario_productos', JSON.stringify(this.productosOriginales));
      this.productosOriginales = [...this.productosOriginales];
      
      this.cerrarModal();
      
      // Muestra la notificación de inmediato y fuerza el refresco visual de Angular
      this.mostrarNotificacion('¡Producto actualizado exitosamente!');
    }
  }

  confirmarEliminacion(prod: any) {
    this.productoAEliminar = prod;
    this.menuActivoIndex = null;
    document.body.style.overflow = 'hidden';
  }

  cancelarEliminacion() {
    this.productoAEliminar = null;
    document.body.style.overflow = 'auto';
  }

  ejecutarEliminacion() {
    if (!this.productoAEliminar) return;

    const prod = this.productoAEliminar;
    this.productosOriginales = this.productosOriginales.filter(p => p.codigo !== prod.codigo);
    
    localStorage.setItem('inventario_productos', JSON.stringify(this.productosOriginales));
    this.productosOriginales = [...this.productosOriginales];
    
    this.registrarAuditoria('ELIMINAR', prod);

    console.group(`🗑️ PRODUCTO ELIMINADO [ ACCIÓN: ELIMINAR ]`);
    console.log('El siguiente producto fue retirado del inventario:');
    console.log(JSON.stringify(prod, null, 2));
    console.groupEnd();

    this.productoAEliminar = null;
    document.body.style.overflow = 'auto';

    // Muestra la notificación de inmediato y fuerza el refresco visual de Angular
    this.mostrarNotificacion('¡Producto eliminado exitosamente!');
  }

  mostrarNotificacion(mensaje: string) {
    this.mensajeNotificacion = mensaje;
    this.cdRef.detectChanges(); // Fuerza a la vista a renderizar el mensaje al instante

    // Limpia la notificación después de 3.5 segundos
    setTimeout(() => {
      if (this.mensajeNotificacion === mensaje) {
        this.mensajeNotificacion = null;
        this.cdRef.detectChanges();
      }
    }, 3500);
  }
}

function verificarSinCambios(p1: any, p2: any): boolean {
  return (
    p1.nombre === p2.nombre &&
    p1.categoria === p2.categoria &&
    p1.bodega === p2.bodega &&
    p1.precio === p2.precio &&
    p1.stock === p2.stock
  );
}