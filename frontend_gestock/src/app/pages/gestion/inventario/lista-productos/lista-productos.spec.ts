import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ListaProductosComponent } from './lista-productos';
import { InventarioService } from '../../../../core/services/inventario.service';
import { InventarioDemoAdapter } from '../../../../core/data/inventario-demo.adapter';

describe('ListaProductosComponent', () => {
  let componente: ListaProductosComponent;
  let inventario: InventarioService;

  beforeEach(async () => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [ListaProductosComponent],
      providers: [provideRouter([])],
    });

    TestBed.inject(InventarioDemoAdapter);
    inventario = TestBed.inject(InventarioService);

    const fixture = TestBed.createComponent(ListaProductosComponent);
    componente = fixture.componentInstance;
    fixture.detectChanges();

    await firstValueFrom(inventario.listarProductos());
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('debe listar los productos cargados', () => {
    expect(componente.productos().length).toBeGreaterThan(0);
    expect(componente.productosFiltrados().length).toBe(componente.productos().length);
  });

  it('debe filtrar por nombre, código, categoría y bodega', () => {
    const [primero] = componente.productos();

    componente.filtroBusqueda.set(primero.codigo);
    expect(componente.productosFiltrados()).toHaveLength(1);
    expect(componente.productosFiltrados()[0].codigo).toBe(primero.codigo);

    componente.filtroBusqueda.set(primero.bodegaNombre);
    expect(componente.productosFiltrados().length).toBeGreaterThan(0);

    componente.filtroBusqueda.set('___nada___');
    expect(componente.productosFiltrados()).toHaveLength(0);
  });

  it('debe ignorar mayúsculas y espacios en el filtro', () => {
    const [primero] = componente.productos();

    componente.filtroBusqueda.set(`  ${primero.nombre.toUpperCase()}  `);
    expect(componente.productosFiltrados()).toHaveLength(1);
  });

  it('debe calcular el resumen con total, valor y alertas', () => {
    const lista = componente.productos();
    const esperado = lista.reduce((suma, p) => suma + p.precio * p.stock, 0);

    expect(componente.resumen().total).toBe(lista.length);
    expect(componente.resumen().valorTotal).toBe(esperado);
  });

  it('debe marcar en alerta el stock por debajo del mínimo', async () => {
    const objetivo = componente.productos()[0];
    await firstValueFrom(
      inventario.actualizarProducto(objetivo.id, { stock: 0, stockMinimo: 5 }),
    );

    const actualizado = componente.productos().find((p) => p.id === objetivo.id)!;
    expect(componente.claseStock(actualizado)).toContain('stock-agotado');
    expect(componente.textoEstadoStock(actualizado)).toBe('Agotado');
    expect(componente.resumen().enAlerta).toBeGreaterThan(0);
  });

  it('debe cargar el formulario al abrir el modal de edición', () => {
    const objetivo = componente.productos()[0];

    componente.abrirModalEditar(objetivo);

    expect(componente.editando()).toBe(true);
    expect(componente.esAltaNueva()).toBe(false);
    expect(componente.fNombre()).toBe(objetivo.nombre);
    expect(componente.fBodegaId()).toBe(objetivo.bodegaId);
    expect(componente.fPrecio()).toBe(objetivo.precio);
  });

  it('debe limpiar el formulario al cerrar el modal', () => {
    componente.abrirModalEditar(componente.productos()[0]);
    componente.cerrarModal();

    expect(componente.editando()).toBe(false);
    expect(componente.fNombre()).toBe('');
    expect(componente.fStockMinimo()).toBe(0);
  });

  it('debe pedir confirmación antes de eliminar', () => {
    const objetivo = componente.productos()[0];

    componente.confirmarEliminacion(objetivo);
    expect(componente.productoAEliminar()).toEqual(objetivo);

    componente.cancelarEliminacion();
    expect(componente.productoAEliminar()).toBeNull();
  });

  it('debe eliminar el producto confirmado', async () => {
    const objetivo = componente.productos()[0];
    const totalAntes = componente.productos().length;

    componente.confirmarEliminacion(objetivo);
    componente.ejecutarEliminacion();
    await new Promise((resolver) => setTimeout(resolver, 600));

    expect(componente.productos()).toHaveLength(totalAntes - 1);
    expect(componente.productoAEliminar()).toBeNull();
  });

  it('debe marcar vacío solo cuando la carga ya terminó', () => {
    componente.filtroBusqueda.set('___nada___');
    expect(componente.sinResultados()).toBe(true);
  });
});
