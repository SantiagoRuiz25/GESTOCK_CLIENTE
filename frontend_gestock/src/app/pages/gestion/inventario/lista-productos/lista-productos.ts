import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { InventarioService } from '../../../../core/services/inventario.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Producto, ProductoUpdate, nivelDeStock } from '../../../../core/models/inventario.model';

/**
 * MÓDULO DE REFERENCIA
 *
 * Este componente es el patrón de referencia para migrar el resto de la app.
 * Los cambios que introduce, y el porqué de cada uno:
 *
 * 1. Los datos vienen de un servicio, no de `localStorage` leído dentro del
 *    componente. Aquí no se sabe de dónde salen; solo se piden y se pintan.
 *
 * 2. Todo el estado mutable es un signal. Por eso este archivo ya no inyecta
 *    `ChangeDetectorRef` ni llama a `detectChanges()`, que era el parche que
 *    se usaba antes para forzar el repintado a mano.
 *
 * 3. Las vistas derivadas usan `computed`. `productosFiltrados` y `resumen`
 *    antes eran getters, así que se recalculaban en cada ciclo de detección
 *    de cambios aunque nada hubiera cambiado.
 *
 * 4. Los errores pasan por `ToastService` y llegan normalizados desde el
 *    interceptor. Desaparecen el `alert()`, el `confirm()` y el toast hecho a
 *    mano con `setTimeout` que tenía este mismo componente.
 *
 * 5. Se eliminan los `document.body.style.overflow`, que congelaban la página
 *    al abrir el modal y la dejaban bloqueada si el usuario pulsaba Esc.
 *
 * 6. Hay estados explícitos de carga, de error y de vacío, en vez de una
 *    tabla que salta de "cargando" a "no hay datos" sin avisar.
 */
@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './lista-productos.html',
  styleUrl: './lista-productos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaProductosComponent implements OnInit {
  private readonly inventario = inject(InventarioService);
  private readonly toast = inject(ToastService);

  readonly productos = this.inventario.productos;
  readonly bodegas = this.inventario.bodegas;
  readonly categorias = this.inventario.categorias;

  /** `true` durante la carga inicial; distingue "vacío" de "aún no ha llegado". */
  readonly cargando = this.inventario.cargando;
  /** `true` mientras se guarda o borra; deshabilita botones y evita doble envío. */
  readonly guardando = signal(false);

  readonly filtroBusqueda = signal('');
  readonly productoEnEdicion = signal<Producto | null>(null);
  readonly productoAEliminar = signal<Producto | null>(null);

  /** ID real del producto; `null` cuando el alta es nueva. */
  private readonly idEnEdicion = signal<number | null>(null);

  // --- Campos del formulario, signals separados ---
  // Separados en lugar de un objeto único porque mutar un objeto dentro de
  // un signal obliga a spreads en cada campo; un signal por campo hace que
  // `[(ngModel)]` sea directo y que `computed` sepa qué cambió.
  readonly fNombre = signal('');
  readonly fCategoria = signal('');
  readonly fBodegaId = signal(0);
  readonly fPrecio = signal(0);
  readonly fStock = signal(0);
  readonly fStockMinimo = signal(0);

  readonly editando = computed(() => this.productoEnEdicion() !== null);
  readonly esAltaNueva = computed(() => this.idEnEdicion() === null);

  /** Catálogo ya filtrado por el texto de búsqueda. */
  readonly productosFiltrados = computed(() => {
    const texto = this.filtroBusqueda().trim().toLowerCase();
    if (!texto) {
      return this.productos();
    }
    return this.productos().filter(
      (p) =>
        p.nombre.toLowerCase().includes(texto) ||
        p.codigo.toLowerCase().includes(texto) ||
        p.categoria.toLowerCase().includes(texto) ||
        p.bodegaNombre.toLowerCase().includes(texto),
    );
  });

  /** Resumen de cabecera. */
  readonly resumen = computed(() => {
    const lista = this.productos();
    return {
      total: lista.length,
      valorTotal: lista.reduce((suma, p) => suma + p.precio * p.stock, 0),
      enAlerta: lista.filter((p) => nivelDeStock(p) !== 'suficiente').length,
    };
  });

  /** Vacío de verdad: ya terminó de cargar y no hay nada que mostrar. */
  readonly sinResultados = computed(
    () => !this.cargando() && this.productosFiltrados().length === 0,
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.inventario.listarProductos().subscribe({
      error: (err: unknown) => this.toast.errorDesdeApi(err, 'No se pudieron cargar los productos.'),
    });

    this.inventario.listarBodegas().subscribe({
      error: (err: unknown) => this.toast.errorDesdeApi(err, 'No se pudieron cargar las bodegas.'),
    });
  }

  abrirModalEditar(producto: Producto): void {
    this.idEnEdicion.set(producto.id);
    this.productoEnEdicion.set(producto);
    this.fNombre.set(producto.nombre);
    this.fCategoria.set(producto.categoria);
    this.fBodegaId.set(producto.bodegaId);
    this.fPrecio.set(producto.precio);
    this.fStock.set(producto.stock);
    this.fStockMinimo.set(producto.stockMinimo);
  }

  cerrarModal(): void {
    this.idEnEdicion.set(null);
    this.productoEnEdicion.set(null);
    this.resetFormulario();
  }

  confirmarEliminacion(producto: Producto): void {
    this.productoAEliminar.set(producto);
  }

  cancelarEliminacion(): void {
    this.productoAEliminar.set(null);
  }

  /**
   * Persiste el formulario.
   *
   * `form.invalid` cubre lo declarado en la plantilla; aquí se añade la
   * comprobación de dominio que el HTML no puede expresar. Los errores por
   * campo que devuelve el backend en un 422 ya llegan mapeados en el
   * `ApiError`, así que no hace falta interpretarlos aquí.
   */
  guardar(form: NgForm): void {
    if (form.invalid || this.guardando()) {
      form.control.markAllAsTouched();
      return;
    }

    const nombre = this.fNombre().trim();
    const categoria = this.fCategoria().trim();
    const bodegaId = this.fBodegaId();

    if (!nombre || !categoria || !bodegaId) {
      this.toast.aviso('Completa todos los campos obligatorios.');
      return;
    }

    this.guardando.set(true);
    const esAlta = this.esAltaNueva();
    const id = this.idEnEdicion();

    const peticion =
      esAlta || id === null
        ? this.inventario.crearProducto({
            codigo: this.codigoGenerado(),
            nombre,
            categoria,
            bodegaId,
            precio: this.fPrecio(),
            stock: this.fStock(),
            stockMinimo: this.fStockMinimo(),
          })
        : this.inventario.actualizarProducto(id, {
            nombre,
            categoria,
            bodegaId,
            precio: this.fPrecio(),
            stock: this.fStock(),
            stockMinimo: this.fStockMinimo(),
          });

    peticion.subscribe({
      next: () => {
        this.toast.exito(esAlta ? 'Producto creado exitosamente.' : 'Producto actualizado exitosamente.');
        this.cerrarModal();
      },
      error: (err: unknown) => this.toast.errorDesdeApi(err, 'No se pudo guardar el producto.'),
      complete: () => this.guardando.set(false),
    });
  }

  ejecutarEliminacion(): void {
    const producto = this.productoAEliminar();
    if (!producto || this.guardando()) {
      return;
    }

    this.guardando.set(true);
    this.inventario.eliminarProducto(producto.id).subscribe({
      next: () => {
        this.toast.exito('Producto eliminado exitosamente.');
        this.productoAEliminar.set(null);
      },
      error: (err: unknown) => this.toast.errorDesdeApi(err, 'No se pudo eliminar el producto.'),
      complete: () => this.guardando.set(false),
    });
  }

  /** Clase CSS del badge de stock; la decisión vive en el dominio, no en el HTML. */
  claseStock(producto: Producto): string {
    switch (nivelDeStock(producto)) {
      case 'agotado':
        return 'insignia-stock stock-agotado';
      case 'bajo':
        return 'insignia-stock stock-bajo';
      default:
        return 'insignia-stock stock-suficiente';
    }
  }

  textoEstadoStock(producto: Producto): string {
    switch (nivelDeStock(producto)) {
      case 'agotado':
        return 'Agotado';
      case 'bajo':
        return 'Stock bajo';
      default:
        return 'Disponible';
    }
  }

  /** Código correlativo legible. En producción lo asigna el servidor. */
  private codigoGenerado(): string {
    const siguiente = this.productos().reduce((max, p) => {
      const numero = Number(p.codigo.replace(/\D/g, ''));
      return Number.isNaN(numero) ? max : Math.max(max, numero);
    }, 0);
    return `PROD-${String(siguiente + 1).padStart(3, '0')}`;
  }

  private resetFormulario(): void {
    this.fNombre.set('');
    this.fCategoria.set('');
    this.fBodegaId.set(0);
    this.fPrecio.set(0);
    this.fStock.set(0);
    this.fStockMinimo.set(0);
  }
}
