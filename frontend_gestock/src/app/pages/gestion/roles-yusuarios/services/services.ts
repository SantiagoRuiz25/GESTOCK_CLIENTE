import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolesUsuariosService {
  private http = inject(HttpClient);
  
  // URL base de la API para la gestión de roles y usuarios
  private apiUrl = 'http://localhost:8080/api/usuarios';

  // Signals reactivos para el manejo de estado en el cliente
  usuarios = signal<any[]>([]);
  roles = signal<any[]>([]);

  constructor() {}

  // ==================== OPERACIONES DE USUARIOS ====================

  /** Obtener lista de usuarios */
  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(data => this.usuarios.set(data))
    );
  }

  /** Crear un nuevo usuario */
  crearUsuario(usuario: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, usuario).pipe(
      tap(nuevo => {
        this.usuarios.update(lista => [...lista, nuevo]);
      })
    );
  }

  /** Actualizar un usuario existente */
  actualizarUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, usuario).pipe(
      tap(actualizado => {
        this.usuarios.update(lista => lista.map(u => u.id === id ? actualizado : u));
      })
    );
  }

  /** Eliminar un usuario */
  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.usuarios.update(lista => lista.filter(u => u.id !== id));
      })
    );
  }

  // ==================== OPERACIONES DE ROLES ====================

  /** Obtener lista de roles disponibles */
  obtenerRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roles`).pipe(
      tap(data => this.roles.set(data))
    );
  }
}