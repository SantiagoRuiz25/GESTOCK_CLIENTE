import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

interface Respuesta<T> {
  Data: T;
}

export interface EmpresaApi {
  id: number;
  nombre: string;
  correo: string;
  moneda: 'COP' | 'USD' | 'EUR';
  formato_fecha: string;
  activo: boolean;
}

export interface FormularioEmpresa {
  nombre: string;
  email: string;
  moneda: string;
  formatoFecha: string;
}

export const etiquetaMoneda: Record<EmpresaApi['moneda'], string> = {
  COP: 'COP - Peso Colombiano',
  USD: 'USD - Dólar',
  EUR: 'EUR - Euro',
};

function convertirFormulario(formulario: FormularioEmpresa) {
  return {
    nombre: formulario.nombre.trim(),
    correo: formulario.email.trim(),
    moneda: formulario.moneda.split(' - ')[0].trim(),
    formato_fecha: formulario.formatoFecha,
  };
}

@Injectable({ providedIn: 'root' })
export class EmpresasService {
  private readonly http = inject(HttpClient);
  private readonly url = '/v1/empresas';

  listar() {
    return this.http.get<Respuesta<EmpresaApi[]>>(this.url)
      .pipe(map(({ Data }) => Data));
  }

  crear(formulario: FormularioEmpresa) {
    return this.http.post<Respuesta<EmpresaApi>>(this.url, convertirFormulario(formulario))
      .pipe(map(({ Data }) => Data));
  }

  actualizar(id: string, formulario: FormularioEmpresa) {
    return this.http.put<Respuesta<EmpresaApi>>(`${this.url}/${id}`, convertirFormulario(formulario))
      .pipe(map(({ Data }) => Data));
  }

  desactivar(id: string) {
    return this.http.delete(`${this.url}/${id}`);
  }
}
