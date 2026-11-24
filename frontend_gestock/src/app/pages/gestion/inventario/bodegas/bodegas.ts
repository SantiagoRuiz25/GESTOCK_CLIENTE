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

  abrirFormulario(): void {
    this.errorFormulario.set('');
    this.mostrarModal.set(true);
  }

  crearBodega(form: NgForm): void {
    if (form.invalid || this.guardando()) return;

    const { capacidad, ...campos } = this.nuevaBodega;
    this.errorFormulario.set('');
    this.guardando.set(true);

    this.http.post<{ Data: BodegaApi }>(this.url, {
      ...campos,
      capacidad_maxima: capacidad,
    }).pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: ({ Data }) => {
        const creada = this.convertirBodega(Data);
        this.bodegas.update((lista) => [creada, ...lista]);
        form.resetForm({
          nombre: '', codigo: '', ciudad: '', direccion: '',
          responsable: '', telefono: '', capacidad: 0,
        });
        this.mostrarModal.set(false);
      },
      error: (error: unknown) => {
        const mensaje = error instanceof HttpErrorResponse ? error.error?.Message : undefined;
        this.errorFormulario.set(
          typeof mensaje === 'string' ? mensaje : 'No se pudo guardar la bodega.'
        );
      },
    });
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

    this.bodegaSeleccionada.set(bodega);
    this.mostrarModalDetalle.set(true);
  }

  cerrarModalDetalle() {
    this.mostrarModalDetalle.set(false);
    this.bodegaSeleccionada.set(null);
  }

}