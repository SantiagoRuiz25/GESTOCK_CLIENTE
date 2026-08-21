import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private http = inject(HttpClient);
  
  // URL base de tu API (ajusta el puerto según tu backend: Go/Beego, NestJS o Django)
  private apiUrl = 'http://localhost:8080/api/inventario';

  // Signals reactivos para manejar los datos globalmente si lo requieres
  productos = signal<any[]>([]);
  bodegas = signal<any[]>([]);

  constructor() {}

  // ==================== OPERACIONES DE PRODUCTOS ====================

  /** Obtener todos los productos */
  obtenerProductos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/productos`).pipe(
      tap(data => this.productos.set(data))
    );
  }

  /** Registrar un nuevo producto */
  crearProducto(producto: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/productos`, producto).pipe(
      tap(nuevo => {
        this.productos.update(lista => [...lista, nuevo]);
      })
    );
  }

  /** Eliminar un producto */
  eliminarProducto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/productos/${id}`).pipe(
      tap(() => {
        this.productos.update(lista => lista.filter(p => p.id !== id));
      })
    );
  }

  // ==================== OPERACIONES DE BODEGAS ====================

  /** Obtener todas las bodegas */
  obtenerBodegas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bodegas`).pipe(
      tap(data => this.bodegas.set(data))
    );
  }

  /** Crear una nueva bodega */
  crearBodega(bodega: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bodegas`, bodega).pipe(
      tap(nueva => {
        this.bodegas.update(lista => [...lista, nueva]);
      })
    );
  }

  /** Cambiar el estado (activo/inactivo) de una bodega */
  toggleEstadoBodega(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/bodegas/${id}/toggle`, {}).pipe(
      tap(() => {
        this.bodegas.update(lista => 
          lista.map(b => b.id === id ? { ...b, activa: !b.activa } : b)
        );
      })
    );
  }
}