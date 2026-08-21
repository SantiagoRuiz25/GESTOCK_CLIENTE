import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KpiResumen, CategoriaReporte } from '../models/reportes';
import { ConfiguracionNotificaciones } from '../models/configuracion';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/v1'; // Ajusta con la URL de tu API en Go/Beego

  constructor(private http: HttpClient) {}

  // --- MÉTODOS DE REPORTES ---
  getKpis(): Observable<KpiResumen> {
    return this.http.get<KpiResumen>(`${this.apiUrl}/reportes/kpis`);
  }

  getCategorias(): Observable<CategoriaReporte[]> {
    return this.http.get<CategoriaReporte[]>(`${this.apiUrl}/reportes/categorias`);
  }

  exportarInventario(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reportes/exportar`, {
      responseType: 'blob'
    });
  }

  // --- MÉTODOS DE CONFIGURACIÓN ---
  getNotificaciones(): Observable<ConfiguracionNotificaciones> {
    return this.http.get<ConfiguracionNotificaciones>(`${this.apiUrl}/configuracion/notificaciones`);
  }

  guardarNotificaciones(config: ConfiguracionNotificaciones): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/configuracion/notificaciones`, config);
  }
}