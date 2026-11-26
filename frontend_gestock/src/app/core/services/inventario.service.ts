import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, map, switchMap, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Bodega, Producto, ProductoCreate, ProductoUpdate } from '../models/inventario.model';

interface Respuesta<T> {
  Data: T;
}

interface CategoriaApi {
  id_categoria: number;
  nombre: string;
  activo: boolean;
}

interface BodegaApi {
  id_bodega: number;
  nombre: string;
  codigo: string;
  activo: boolean;
}

interface ProductoApi {
  categoria_nombre?: string;
  bodega_nombre?: string;
  id: number;
  id_categoria: number;
  id_bodega: number;
  codigo: string;
  nombre: string;
  precio: number;
  stock: number;
  stock_minimo: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
}

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly http = inject(HttpClient);
  private readonly url = '/v1/productos';

  private readonly _productos = signal<Producto[]>([]);
  private readonly _bodegas = signal<Bodega[]>([]);
  private readonly _categorias = signal<CategoriaApi[]>([]);
  private readonly _cargando = signal(false);

  readonly productos = this._productos.asReadonly();
  readonly bodegas = this._bodegas.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly categorias = computed(() =>
    this._categorias().filter((categoria) => categoria.activo).map((categoria) => categoria.nombre),
  );

  listarCategorias(): Observable<string[]> {
    return this.http.get<Respuesta<CategoriaApi[]>>('/v1/categorias').pipe(
      tap(({ Data }) => this._categorias.set(Data)),
      map(() => this.categorias()),
    );
  }

  listarBodegas(): Observable<Bodega[]> {
    return this.http.get<Respuesta<BodegaApi[]>>('/v1/bodega').pipe(
      map(({ Data }) => Data.map((bodega) => ({
        id: bodega.id_bodega,
        nombre: bodega.nombre,
        codigo: bodega.codigo,
        activa: bodega.activo,
      }))),
      tap((bodegas) => this._bodegas.set(bodegas)),
    );
  }

  listarProductos(): Observable<Producto[]> {
    this._cargando.set(true);

    return this.http.get<Respuesta<ProductoApi[]>>(this.url).pipe(
      map(({ Data }) => Data.map((producto) => this.convertirProducto(producto))),
      tap((productos) => this._productos.set(productos)),
      finalize(() => this._cargando.set(false)),
    );
  }

  crearProducto(input: ProductoCreate): Observable<Producto> {
    this._cargando.set(true);

    return this.http.post<Respuesta<ProductoApi>>(this.url, {
      codigo: input.codigo,
      nombre: input.nombre,
      id_categoria: this._categorias().find((categoria) =>
        categoria.activo && categoria.nombre === input.categoria)?.id_categoria,
      id_bodega: input.bodegaId,
      precio: input.precio,
      stock: input.stock,
      stock_minimo: input.stockMinimo,
    }).pipe(
      map(({ Data }) => this.convertirProducto(Data)),
      tap((nuevo) => this._productos.update((lista) => [nuevo, ...lista])),
      finalize(() => this._cargando.set(false)),
    );
  }

  actualizarProducto(id: number, cambios: ProductoUpdate): Observable<Producto> {
    this._cargando.set(true);
    const url = `${this.url}/${id}`;

    return this.http.get<Respuesta<ProductoApi>>(url).pipe(
      switchMap(({ Data: actual }) => {
        const categoriaActual = this._categorias().find((categoria) =>
          categoria.id_categoria === actual.id_categoria);
        const idCategoria = cambios.categoria === undefined || cambios.categoria === (actual.categoria_nombre ?? categoriaActual?.nombre)
          ? actual.id_categoria
          : this._categorias().find((categoria) =>
            categoria.activo && categoria.nombre === cambios.categoria)?.id_categoria;

        return this.http.put<Respuesta<ProductoApi>>(url, {
          codigo: actual.codigo,
          nombre: cambios.nombre ?? actual.nombre,
          id_categoria: idCategoria,
          id_bodega: cambios.bodegaId ?? actual.id_bodega,
          precio: cambios.precio ?? actual.precio,
          stock: cambios.stock ?? actual.stock,
          stock_minimo: cambios.stockMinimo ?? actual.stock_minimo,
        });
      }),
      map(({ Data }) => this.convertirProducto(Data)),
      tap((actualizado) => this._productos.update((lista) =>
        lista.map((producto) => producto.id === id ? actualizado : producto))),
      finalize(() => this._cargando.set(false)),
    );
  }

  eliminarProducto(id: number): Observable<void> {
    this._cargando.set(true);

    return this.http.delete(`${this.url}/${id}`).pipe(
      tap(() => this._productos.update((lista) => lista.filter((producto) => producto.id !== id))),
      map(() => undefined),
      finalize(() => this._cargando.set(false)),
    );
  }

  exportarProductoCsv(id: number): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/inventario/productos/${id}/exportar`, {
      responseType: 'blob',
    });
  }

  private convertirProducto(producto: ProductoApi): Producto {
    return {
      id: producto.id,
      codigo: producto.codigo,
      nombre: producto.nombre,
      categoria: producto.categoria_nombre ?? this._categorias().find((categoria) =>
        categoria.id_categoria === producto.id_categoria)?.nombre ?? `Categoría ${producto.id_categoria}`,
      bodegaId: producto.id_bodega,
      bodegaNombre: producto.bodega_nombre ?? this._bodegas().find((bodega) =>
        bodega.id === producto.id_bodega)?.nombre ?? `Bodega ${producto.id_bodega}`,
      precio: producto.precio,
      stock: producto.stock,
      stockMinimo: producto.stock_minimo,
      activo: producto.activo,
      creadoEn: producto.fecha_creacion,
      actualizadoEn: producto.fecha_modificacion,
    };
  }
}