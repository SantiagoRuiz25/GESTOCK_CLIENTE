import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Empresa {
  id: string;
  nombre: string;
  email: string;
  moneda: string;
  formatoFecha: string;
  bodegasActivas: number;
  totalPrecios: number;
  valorInventario: number;
  alertasStock: number;
  activa?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  // Lista inicial de empresas (simulando las que se ven en tu imagen)
  private _empresas = new BehaviorSubject<Empresa[]>([
    { id: '1', nombre: 'GESTOCK Inc.', email: 'contacto@gestock.com', moneda: 'USD - Dólar', formatoFecha: 'DD/MM/YYYY', bodegasActivas: 3, totalPrecios: 19, valorInventario: 29997, alertasStock: 4, activa: true },
    { id: '2', nombre: 'Logística del Llano SAS', email: 'info@logisticallh.co', moneda: 'COP - Peso Colombiano', formatoFecha: 'YYYY-MM-DD', bodegasActivas: 5, totalPrecios: 42, valorInventario: 85000, alertasStock: 2, activa: true },
    { id: '3', nombre: 'Distribuciones Globales', email: 'ventas@distribucionesg.com', moneda: 'USD - Dólar', formatoFecha: 'MM/DD/YYYY', bodegasActivas: 2, totalPrecios: 10, valorInventario: 12000, alertasStock: 1, activa: false }
  ]);
  
  empresas$ = this._empresas.asObservable();

  private _empresaActual = new BehaviorSubject<Empresa>(this._empresas.value[0]);
  empresaActual$ = this._empresaActual.asObservable();

  cambiarEmpresaActiva(empresa: Empresa): void {
    this._empresaActual.next(empresa);
  }

  seleccionarEmpresaPorId(id: string): void {
    const encontrada = this._empresas.value.find(e => e.id === id);
    if (encontrada) {
      this.cambiarEmpresaActiva(encontrada);
    }
  }
}