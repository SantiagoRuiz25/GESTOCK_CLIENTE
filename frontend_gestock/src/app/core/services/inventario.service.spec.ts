import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { InventarioService } from './inventario.service';
import { InventarioDemoAdapter } from '../data/inventario-demo.adapter';
import { Producto, ProductoCreate } from '../models/inventario.model';
import { ApiError } from '../models/api.model';

describe('InventarioService', () => {
  let service: InventarioService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({});
    // Se instancia el adaptador antes que el servicio para que la semilla
    // esté escrita cuando el servicio la lea en su primer arranque.
    TestBed.inject(InventarioDemoAdapter);
    service = TestBed.inject(InventarioService);
  });

  afterEach(() => localStorage.clear());

  it('debe cargar el catálogo y publicarlo en el signal', async () => {
    await firstValueFrom(service.listarProductos());

    expect(service.productos().length).toBeGreaterThan(0);
    expect(service.cargando()).toBe(false);
  });

  it('debe exponer categorías distintas y ordenadas', async () => {
    await firstValueFrom(service.listarProductos());

    const categorias = service.categorias();
    expect(categorias).toEqual([...categorias].sort((a, b) => a.localeCompare(b)));
    expect(new Set(categorias).size).toBe(categorias.length);
  });

  it('debe crear un producto y anteponerlo en la lista', async () => {
    await firstValueFrom(service.listarProductos());
    const totalAntes = service.productos().length;

    const nuevo: ProductoCreate = {
      codigo: 'PROD-999',
      nombre: 'Monitor 4K',
      categoria: 'Tecnología',
      bodegaId: 1,
      precio: 1_200_000,
      stock: 4,
      stockMinimo: 2,
    };

    const creado = await firstValueFrom(service.crearProducto(nuevo));

    expect(creado.codigo).toBe('PROD-999');
    // La bodega viene desnormalizada desde el adaptador, como lo haría el backend.
    expect(creado.bodegaNombre).toBe('Bodega Central');
    expect(service.productos()).toHaveLength(totalAntes + 1);
    expect(service.productos()[0].codigo).toBe('PROD-999');
  });

  it('debe rechazar un código duplicado con un 409', async () => {
    await firstValueFrom(service.listarProductos());

    await expect(
      firstValueFrom(
        service.crearProducto({
          codigo: 'PROD-001',
          nombre: 'Duplicado',
          categoria: 'Tecnología',
          bodegaId: 1,
          precio: 1,
          stock: 1,
          stockMinimo: 1,
        }),
      ),
    ).rejects.toThrowError(ApiError);
  });

  it('debe rechazar una bodega inexistente con errores por campo', async () => {
    await firstValueFrom(service.listarProductos());

    try {
      await firstValueFrom(
        service.crearProducto({
          codigo: 'PROD-888',
          nombre: 'Sin bodega',
          categoria: 'Otros',
          bodegaId: 9999,
          precio: 1,
          stock: 1,
          stockMinimo: 1,
        }),
      );
      expect.unreachable('debería haber fallado');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).erroresCampos['bodegaId']).toBeTruthy();
    }
  });

  it('debe actualizar solo los campos indicados', async () => {
    await firstValueFrom(service.listarProductos());
    const original = service.productos()[0];

    const actualizado = await firstValueFrom(
      service.actualizarProducto(original.id, { stock: 99 }),
    );

    expect(actualizado.stock).toBe(99);
    // Lo no tocado se conserva.
    expect(actualizado.nombre).toBe(original.nombre);
    expect(actualizado.precio).toBe(original.precio);
    expect(actualizado.bodegaNombre).toBe(original.bodegaNombre);
  });

  it('debe renombrar la bodega desnormalizada al reasignar', async () => {
    await firstValueFrom(service.listarProductos());
    await firstValueFrom(service.listarBodegas());
    const original: Producto = service.productos()[0];

    const bodegaDistinta = service.bodegas().find((b) => b.id !== original.bodegaId)!;
    const actualizado = await firstValueFrom(
      service.actualizarProducto(original.id, { bodegaId: bodegaDistinta.id }),
    );

    expect(actualizado.bodegaId).toBe(bodegaDistinta.id);
    expect(actualizado.bodegaNombre).toBe(bodegaDistinta.nombre);
  });

  it('debe eliminar el producto y sacarlo del signal', async () => {
    await firstValueFrom(service.listarProductos());
    const objetivo = service.productos()[0];
    const totalAntes = service.productos().length;

    await firstValueFrom(service.eliminarProducto(objetivo.id));

    expect(service.productos()).toHaveLength(totalAntes - 1);
    expect(service.productos().some((p) => p.id === objetivo.id)).toBe(false);
  });

  it('debe devolver 404 al eliminar algo que no existe', async () => {
    await expect(firstValueFrom(service.eliminarProducto(999999))).rejects.toThrowError(
      ApiError,
    );
  });
});
