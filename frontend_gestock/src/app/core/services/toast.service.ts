import { Injectable, inject, signal } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';

import { ApiError } from '../models/api.model';

export type TipoToast = 'exito' | 'error' | 'aviso' | 'info';

/** Toast con su metadato ya resuelto, listo para pintar. */
export interface ToastVivo {
  id: number;
  mensaje: string;
  tipo: TipoToast;
  icono: string;
  duracionMs: number;
}

const DURACION_POR_TIPO: Record<TipoToast, number> = {
  exito: 4000,
  info: 4000,
  aviso: 5000,
  /** Los errores se quedan más tiempo: suelen requerir leerse. */
  error: 6500,
};

const ICONO_POR_TIPO: Record<TipoToast, string> = {
  exito: '✓',
  error: '✕',
  aviso: '!',
  info: 'i',
};

const MAXIMO_VISIBLES = 4;

/**
 * Notificaciones unificadas para toda la aplicación.
 *
 * Antes de esto convivían tres sistemas distintos para el mismo concepto:
 * `alert()` nativo en ocho sitios, un `confirm()` nativo en empresa.ts, y un
 * toast implementado a mano dentro de auditorias.ts con `setTimeout`. Tres
 * comportamientos distintos, y ninguno anunciaba nada a lectores de pantalla.
 *
 * Este servicio es el dueño de la pila y de los temporizadores; el componente
 * `ToastContainerComponent` solo pinta lo que hay aquí. Al vivir el estado en
 * el servicio, un toast sobrevive a la destrucción del componente, que es lo
 * que pasa con las notificaciones de "guardado con éxito" al cambiar de vista.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly announcer = inject(LiveAnnouncer);
  private static siguienteId = 0;

  private readonly _toasts = signal<ToastVivo[]>([]);
  private readonly temporizadores = new Map<number, ReturnType<typeof setTimeout>>();

  /** Pila de toasts visibles, en orden de aparición. */
  readonly toasts = this._toasts.asReadonly();

  exito(mensaje: string): void {
    this.mostrar(mensaje, 'exito');
  }

  info(mensaje: string): void {
    this.mostrar(mensaje, 'info');
  }

  aviso(mensaje: string): void {
    this.mostrar(mensaje, 'aviso');
  }

  error(mensaje: string): void {
    this.mostrar(mensaje, 'error');
  }

  /**
   * Muestra un `ApiError` con el mensaje que ya llega normalizado desde el
   * interceptor. Los 5xx se muestran sin detalle técnico: el detalle va a la
   * consola, no a la pantalla del usuario.
   */
  errorDesdeApi(fallo: unknown, alternativa = 'No se pudo completar la operación.'): void {
    this.mostrar(fallo instanceof ApiError ? fallo.mensaje : alternativa, 'error');
  }

  /**
   * Encola un toast.
   *
   * Se anuncia por `LiveAnnouncer` además de pintarse: sin esto, un usuario de
   * lector de pantalla no se entera de que el guardado falló, porque el
   * `alert()` nativo del navegador tampoco se lo anunciaba.
   */
  mostrar(mensaje: string, tipo: TipoToast = 'info'): number {
    const id = ++ToastService.siguienteId;
    const toast: ToastVivo = {
      id,
      mensaje,
      tipo,
      icono: ICONO_POR_TIPO[tipo],
      duracionMs: DURACION_POR_TIPO[tipo],
    };

    this._toasts.update((lista) => {
      const siguiente = [...lista, toast];
      // Si se acumulan más de los permitidos se retira el más antiguo: un
      // aviso que nadie va a leer porque hay cinco encima no informa de nada.
      return siguiente.length > MAXIMO_VISIBLES ? siguiente.slice(-MAXIMO_VISIBLES) : siguiente;
    });

    const temporizador = setTimeout(() => this.cerrar(id), toast.duracionMs);
    this.temporizadores.set(id, temporizador);

    this.announcer.announce(mensaje, tipo === 'error' ? 'assertive' : 'polite');

    return id;
  }

  /** Cierra un toast concreto y cancela su temporizador. */
  cerrar(id: number): void {
    const temporizador = this.temporizadores.get(id);
    if (temporizador) {
      clearTimeout(temporizador);
      this.temporizadores.delete(id);
    }
    this._toasts.update((lista) => lista.filter((t) => t.id !== id));
  }

  /** Cierra todos los toasts. Útil al cambiar de usuario o al cerrar sesión. */
  cerrarTodos(): void {
    for (const temporizador of this.temporizadores.values()) {
      clearTimeout(temporizador);
    }
    this.temporizadores.clear();
    this._toasts.set([]);
  }
}
