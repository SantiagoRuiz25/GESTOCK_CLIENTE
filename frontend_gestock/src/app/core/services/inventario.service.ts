import { map } from 'rxjs';
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Bodega, Producto, ProductoCreate, ProductoUpdate } from '../models/inventario.model';
import { InventarioDemoAdapter } from '../data/inventario-demo.adapter';

/**
 * Punto Ãºnico de acceso a los datos de inventario.
 *
 * Este servicio reemplaza al `services.ts` que habÃ­a dentro de la carpeta
 * `lista-productos`, que tenÃ­a tres defectos: apuntar a
 * `http://localhost:8080` hardcodeado, devolver `any` en todas las firmas, y
 * no estar registrado con `provideHttpClient()` (por lo que inyectarlo lanzaba
 * `NullInjectorError`).
 *
 * La novedad frente a aquel intento es que el estado vive en signals y no en
 * `BehaviorSubject` mutado a mano. Los componentes leen con `productos()` y
 * Angular se encarga del refresco, asÃ­ que desaparecen los
 * `ChangeDetectorRef.detectChanges()` que habÃ­a puesto a mano para forzar
 * el repintado.
 */
@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly http = inject(HttpClient);
  private readonly demo = inject(InventarioDemoAdapter);
  private readonly baseUrl = `${environment.apiUrl}/inventario`;

  private readonly _productos = signal<Producto[]>([]);
  private readonly _bodegas = signal<Bodega[]>([]);
  private readonly _cargando = signal(false);

  readonly productos = this._productos.asReadonly();
  readonly bodegas = this._bodegas.asReadonly();

  /** `true` mientras hay una peticiÃ³n en vuelo; los skeletons se muestran con esto. */
  readonly cargando = this._cargando.asReadonly();

  /** CategorÃ­as distintas presentes en el catÃ¡logo, para poblar el selector. */
  readonly categorias = computed(() =>
    [...new Set(this._productos().map((p) => p.categoria))].sort((a, b) => a.localeCompare(b)),
  );

  listarProductos(): Observable<Producto[]> {
    this._cargando.set(true);
    const url = 'productosMidUrl' in environment ? environment.productosMidUrl : undefined;
    const peticion = typeof url === 'string'
      ? this.http.get<{ Data: Producto[] }>(url).pipe(map((respuesta) => respuesta.Data))
      : environment.useMockApi
        ? this.demo.listarProductos()
      : this.http.get<Producto[]>(`${this.baseUrl}/productos`);

    return peticion.pipe(
      tap((productos) => this._productos.set(productos)),
      finalize(() => this._cargando.set(false)),
    );
  }

  listarBodegas(): Observable<Bodega[]> {
    const peticion = environment.useMockApi
      ? this.demo.listarBodegas()
      : this.http.get<Bodega[]>(`${this.baseUrl}/bodegas`);

    return peticion.pipe(tap((bodegas) => this._bodegas.set(bodegas)));
  }

  crearProducto(input: ProductoCreate): Observable<Producto> {
    this._cargando.set(true);
    const peticion = environment.useMockApi
      ? this.demo.crearProducto(input)
      : this.http.post<Producto>(`${this.baseUrl}/productos`, input);

    return peticion.pipe(
      tap((nuevo) => this._productos.update((lista) => [nuevo, ...lista])),
      finalize(() => this._cargando.set(false)),
    );
  }

  actualizarProducto(id: number, cambios: ProductoUpdate): Observable<Producto> {
    this._cargando.set(true);
    const peticion = environment.useMockApi
      ? this.demo.actualizarProducto(id, cambios)
      : this.http.patch<Producto>(`${this.baseUrl}/productos/${id}`, cambios);

    return peticion.pipe(
      tap((actualizado) =>
        this._productos.update((lista) => lista.map((p) => (p.id === id ? actualizado : p))),
      ),
      finalize(() => this._cargando.set(false)),
    );
  }

  eliminarProducto(id: number): Observable<void> {
    this._cargando.set(true);
    const peticion = environment.useMockApi
      ? this.demo.eliminarProducto(id)
      : this.http.delete<void>(`${this.baseUrl}/productos/${id}`);

    return peticion.pipe(
      tap(() => this._productos.update((lista) => lista.filter((p) => p.id !== id))),
      finalize(() => this._cargando.set(false)),
    );
  }

  /**
   * Descarga el catÃ¡logo. Va al backend y no a montar el CSV en el navegador:
   * un catÃ¡logo real puede pesar mÃ¡s que el heap del cliente, y el reporte
   * debe reflejar permisos y filtros del servidor.
   */
  exportarProductoCsv(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/productos/${id}/exportar`, {
      responseType: 'blob',
    });
  }
}
