import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { Bodega, Producto, ProductoCreate, ProductoUpdate } from '../models/inventario.model';
import { ApiError } from '../models/api.model';

const CLAVE_PRODUCTOS = 'gestock.inventario.productos';
const CLAVE_BODEGAS = 'gestock.inventario.bodegas';

/**
 * Adaptador local de inventario, usado solo cuando `useMockApi` es `true`.
 *
 * Mantiene la app operable antes de que exista el backend, pero respeta el
 * mismo contrato que la API real: devuelve Observables, emite los mismos
 * tipos y falla con `ApiError` en los mismos casos. Así, el componente no
 * cambia ni una línea cuando se apaga el modo demo, y lo que se desarrolla
 * contra este adaptador es exactamente lo que irá contra el servidor.
 */
@Injectable({ providedIn: 'root' })
export class InventarioDemoAdapter {
  private readonly _productos = signal<Producto[]>(this.leer(CLAVE_PRODUCTOS, []));
  private readonly _bodegas = signal<Bodega[]>(this.leer(CLAVE_BODEGAS, []));

  /** Latencia simulada, para que los skeletons se vean en desarrollo. */
  private readonly latencia = 350;

  constructor() {
    if (this._bodegas().length === 0) {
      this.semilla();
    }
  }

  listarProductos(): Observable<Producto[]> {
    return of(this._productos()).pipe(delay(this.latencia));
  }

  listarBodegas(): Observable<Bodega[]> {
    return of(this._bodegas()).pipe(delay(this.latencia));
  }

  crearProducto(input: ProductoCreate): Observable<Producto> {
    const existentes = this._productos();

    if (existentes.some((p) => p.codigo.toLowerCase() === input.codigo.trim().toLowerCase())) {
      return throwError(
        () =>
          new ApiError({
            status: 409,
            mensaje: `Ya existe un producto con el código ${input.codigo}.`,
            erroresCampos: { codigo: 'Este código ya está en uso.' },
          }),
      );
    }

    const bodega = this._bodegas().find((b) => b.id === input.bodegaId);
    if (!bodega) {
      return throwError(
        () =>
          new ApiError({
            status: 422,
            mensaje: 'La bodega seleccionada no existe.',
            erroresCampos: { bodegaId: 'Selecciona una bodega válida.' },
          }),
      );
    }

    const ahora = new Date().toISOString();
    const nuevo: Producto = {
      id: this.siguienteId(existentes),
      codigo: input.codigo.trim(),
      nombre: input.nombre.trim(),
      categoria: input.categoria,
      bodegaId: bodega.id,
      bodegaNombre: bodega.nombre,
      precio: input.precio,
      stock: input.stock,
      stockMinimo: input.stockMinimo,
      activo: true,
      creadoEn: ahora,
      actualizadoEn: ahora,
    };

    this.escribirProductos([nuevo, ...existentes]);
    return of(nuevo).pipe(delay(this.latencia));
  }

  actualizarProducto(id: number, cambios: ProductoUpdate): Observable<Producto> {
    const existentes = this._productos();
    const indice = existentes.findIndex((p) => p.id === id);

    if (indice === -1) {
      return throwError(
        () => new ApiError({ status: 404, mensaje: 'El producto no existe.' }),
      );
    }

    const actual = existentes[indice];
    const bodega = cambios.bodegaId
      ? this._bodegas().find((b) => b.id === cambios.bodegaId)
      : this._bodegas().find((b) => b.id === actual.bodegaId);

    if (!bodega) {
      return throwError(
        () =>
          new ApiError({
            status: 422,
            mensaje: 'La bodega seleccionada no existe.',
            erroresCampos: { bodegaId: 'Selecciona una bodega válida.' },
          }),
      );
    }

    const actualizado: Producto = {
      ...actual,
      ...cambios,
      bodegaId: bodega.id,
      bodegaNombre: bodega.nombre,
      actualizadoEn: new Date().toISOString(),
    };

    const copia = [...existentes];
    copia[indice] = actualizado;
    this.escribirProductos(copia);

    return of(actualizado).pipe(delay(this.latencia));
  }

  eliminarProducto(id: number): Observable<void> {
    const existentes = this._productos();
    if (!existentes.some((p) => p.id === id)) {
      return throwError(
        () => new ApiError({ status: 404, mensaje: 'El producto no existe.' }),
      );
    }
    this.escribirProductos(existentes.filter((p) => p.id !== id));
    return of(void 0).pipe(delay(this.latencia));
  }

  private siguienteId(productos: Producto[]): number {
    return productos.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  }

  private escribirProductos(productos: Producto[]): void {
    this._productos.set(productos);
    this.guardar(CLAVE_PRODUCTOS, productos);
  }

  private semilla(): void {
    const ahora = new Date().toISOString();
    const bodegas: Bodega[] = [
      { id: 1, nombre: 'Bodega Central', codigo: 'BC-01', activa: true },
      { id: 2, nombre: 'Bodega Norte', codigo: 'BN-02', activa: true },
      { id: 3, nombre: 'Bodega de Despacho', codigo: 'BD-03', activa: true },
    ];

    const productos: Producto[] = [
      {
        id: 1,
        codigo: 'PROD-001',
        nombre: 'Laptop HP ProBook',
        categoria: 'Tecnología',
        bodegaId: 1,
        bodegaNombre: 'Bodega Central',
        precio: 2_500_000,
        stock: 12,
        stockMinimo: 5,
        activo: true,
        creadoEn: ahora,
        actualizadoEn: ahora,
      },
      {
        id: 2,
        codigo: 'PROD-002',
        nombre: 'Mouse Inalámbrico Logitech',
        categoria: 'Accesorios',
        bodegaId: 2,
        bodegaNombre: 'Bodega Norte',
        precio: 65_000,
        stock: 45,
        stockMinimo: 10,
        activo: true,
        creadoEn: ahora,
        actualizadoEn: ahora,
      },
      {
        id: 3,
        codigo: 'PROD-003',
        nombre: 'Silla Ergonómica Ejecutiva',
        categoria: 'Mobiliario',
        bodegaId: 1,
        bodegaNombre: 'Bodega Central',
        precio: 450_000,
        stock: 8,
        stockMinimo: 4,
        activo: true,
        creadoEn: ahora,
        actualizadoEn: ahora,
      },
    ];

    this._bodegas.set(bodegas);
    this.guardar(CLAVE_BODEGAS, bodegas);
    this.escribirProductos(productos);
  }

  private leer<T>(clave: string, porDefecto: T): T {
    if (typeof localStorage === 'undefined') {
      return porDefecto;
    }
    const crudo = localStorage.getItem(clave);
    if (!crudo) {
      return porDefecto;
    }
    try {
      return JSON.parse(crudo) as T;
    } catch {
      return porDefecto;
    }
  }

  private guardar(clave: string, valor: unknown): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(clave, JSON.stringify(valor));
  }
}
