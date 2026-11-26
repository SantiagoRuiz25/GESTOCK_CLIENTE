import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

interface Bodega {
  id: number;
  nombre: string;
  codigo: string;
  ciudad: string;
  direccion: string;
  responsable: string;
  telefono: string;
  capacidad: number;
  activa: boolean;
  icono: string;
}

type BodegaApi = Omit<Bodega, 'id' | 'capacidad' | 'activa' | 'icono'> & {
  id_bodega: number;
  capacidad_maxima: number;
  activo: boolean;
};

@Component({
  selector: 'app-bodegas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bodegas.html',
  styleUrls: ['./bodegas.css']
})
export class BodegasComponent implements OnInit {
  mostrarModal = signal(false);
  mostrarModalDetalle = signal(false);
  bodegaSeleccionada = signal<Bodega | null>(null);

  // Objeto vinculado al formulario de nueva bodega
  nuevaBodega = {
    nombre: '',
    codigo: '',
    ciudad: '',
    direccion: '',
    responsable: '',
    telefono: '',
    capacidad: 0
  };

  private readonly http = inject(HttpClient);
  private readonly url = '/v1/bodega';
  readonly bodegas = signal<Bodega[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly errorListado = signal('');
  readonly errorFormulario = signal('');

  ngOnInit(): void {
    this.http.get<{ Data: BodegaApi[] }>(this.url)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ Data }) => this.bodegas.set(Data.map((bodega) => this.convertirBodega(bodega))),
        error: () => this.errorListado.set('No se pudo cargar el listado de bodegas.'),
      });
  }

  readonly idEnEdicion = signal<number | null>(null);
  readonly desactivando = signal(false);
  readonly errorDetalle = signal('');

  abrirFormulario(bodega?: Bodega): void {
    this.idEnEdicion.set(bodega?.id ?? null);
    this.nuevaBodega = {
      nombre: bodega?.nombre ?? '',
      codigo: bodega?.codigo ?? '',
      ciudad: bodega?.ciudad ?? '',
      direccion: bodega?.direccion ?? '',
      responsable: bodega?.responsable ?? '',
      telefono: bodega?.telefono ?? '',
      capacidad: bodega?.capacidad ?? 0,
    };
    this.errorFormulario.set('');
    this.cerrarModalDetalle();
    this.mostrarModal.set(true);
  }

  crearBodega(form: NgForm): void {
    if (form.invalid || this.guardando()) return;

    const { capacidad, ...campos } = this.nuevaBodega;
    const datos = { ...campos, capacidad_maxima: capacidad };
    const id = this.idEnEdicion();
    const peticion = id === null
      ? this.http.post<{ Data: BodegaApi }>(this.url, datos)
      : this.http.put<{ Data: BodegaApi }>(`${this.url}/${id}`, datos);

    this.errorFormulario.set('');
    this.guardando.set(true);
    peticion.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: ({ Data }) => {
        const guardada = this.convertirBodega(Data);
        this.bodegas.update((lista) => id === null
          ? [guardada, ...lista]
          : lista.map((bodega) => bodega.id === id ? guardada : bodega));
        this.mostrarModal.set(false);
      },
      error: (error: unknown) => {
        this.errorFormulario.set(this.mensajeError(error, 'No se pudo guardar la bodega.'));
      },
    });
  }

  desactivarBodega(bodega: Bodega): void {
    if (!bodega.activa || this.desactivando()) return;
    if (!window.confirm(`¿Desactivar la bodega ${bodega.nombre}?`)) return;

    this.errorDetalle.set('');
    this.desactivando.set(true);
    this.http.delete(`${this.url}/${bodega.id}`)
      .pipe(finalize(() => this.desactivando.set(false)))
      .subscribe({
        next: () => {
          const inactiva = { ...bodega, activa: false };
          this.bodegas.update((lista) =>
            lista.map((actual) => actual.id === bodega.id ? inactiva : actual));
          this.bodegaSeleccionada.set(inactiva);
        },
        error: (error: unknown) => {
          this.errorDetalle.set(this.mensajeError(error, 'No se pudo desactivar la bodega.'));
        },
      });
  }

  private mensajeError(error: unknown, alternativa: string): string {
    const mensaje = error instanceof HttpErrorResponse ? error.error?.Message : undefined;
    return typeof mensaje === 'string' ? mensaje : alternativa;
  }

  private convertirBodega({ id_bodega, capacidad_maxima, activo, ...datos }: BodegaApi): Bodega {
    return {
      ...datos,
      id: id_bodega,
      capacidad: capacidad_maxima,
      activa: activo,
      icono: '📦',
    };
  }

  // Método al hacer clic en una tarjeta con salida JSON en consola
  verDetalleBodega(bodega: Bodega, event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest('.switch-container') || target.closest('input')) {
      return;
    }
    
    // Muestra en formato JSON limpio la bodega seleccionada y sus productos en la consola

    this.errorDetalle.set('');
    this.bodegaSeleccionada.set(bodega);
    this.mostrarModalDetalle.set(true);
  }

  cerrarModalDetalle() {
    this.mostrarModalDetalle.set(false);
    this.bodegaSeleccionada.set(null);
  }

}