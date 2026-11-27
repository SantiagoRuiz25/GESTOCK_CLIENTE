import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Subscription, finalize } from 'rxjs';

interface EmpresaPanel {
  id: number;
  nombre: string;
}

interface AlertaPanel {
  id: number;
  producto: string;
  bodega: string;
  stock: number;
  stock_minimo: number;
}

interface MovimientoPanel {
  id: number;
  producto: string;
  tipo: string;
  cantidad: number;
  fecha: string;
  responsable: string | null;
}

interface ResumenPanel {
  productos_activos: number;
  valor_inventario: number;
  stock_bajo: number;
  agotados: number;
  bodegas_activas: number;
  capacidad_activa: number;
  unidades_ocupadas: number;
  ocupacion_porcentaje: number | null;
  usuarios_activos: number;
  empresas_activas: EmpresaPanel[];
  alertas_stock: AlertaPanel[];
  ultimos_movimientos: MovimientoPanel[];
}

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class PanelComponent implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly navegador = isPlatformBrowser(inject(PLATFORM_ID));
  private peticion?: Subscription;

  readonly resumen = signal<ResumenPanel | null>(null);
  readonly empresaId = signal<number | null>(null);
  readonly cargando = signal(false);
  readonly error = signal('');

  readonly empresaSeleccionada = computed(() =>
    this.resumen()?.empresas_activas.find((empresa) => empresa.id === this.empresaId()),
  );

  ngOnInit(): void {
    if (!this.navegador) return;

    const id = Number(localStorage.getItem('empresaIdSeleccionada'));
    if (Number.isInteger(id) && id > 0) {
      this.empresaId.set(id);
    }
    this.cargarResumen();
  }

  ngOnDestroy(): void {
    this.peticion?.unsubscribe();
  }

  cambiarEmpresa(valor: string): void {
    const id = Number(valor);
    const empresas = this.resumen()?.empresas_activas ?? [];
    if (!empresas.some((empresa) => empresa.id === id)) return;
    if (id === this.empresaId()) return;

    this.guardarSeleccion(id);
    this.cargarResumen();
  }

  cargarResumen(): void {
    this.peticion?.unsubscribe();
    this.error.set('');
    this.cargando.set(true);

    this.peticion = this.http
      .get<{ Data: ResumenPanel }>('/v1/panel/resumen')
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ Data }) => {
          this.resumen.set(Data);

          const seleccionValida = Data.empresas_activas.some(
            (empresa) => empresa.id === this.empresaId(),
          );
          if (!seleccionValida) {
            this.guardarSeleccion(Data.empresas_activas[0]?.id ?? null);
          }
        },
        error: () => {
          this.error.set('No se pudo actualizar el resumen del Panel.');
        },
      });
  }

  private guardarSeleccion(id: number | null): void {
    this.empresaId.set(id);
    if (!this.navegador) return;

    if (id === null) {
      localStorage.removeItem('empresaIdSeleccionada');
    } else {
      localStorage.setItem('empresaIdSeleccionada', String(id));
    }
  }
}