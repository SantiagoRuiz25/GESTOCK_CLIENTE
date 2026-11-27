import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToastService } from '../services/toast.service';

/**
 * Vista del stack de notificaciones.
 *
 * No guarda estado: lo lee de `ToastService`, que es el dueño de la pila y
 * de los temporizadores. Así el estado sobrevive a que este componente se
 * destruya y se vuelva a crear, que es justo lo que pasa al navegar.
 *
 * Este componente sustituye a `MatSnackBar`. Snackbar arrastraba el CDK
 * Overlay y el Portal al bundle inicial: como `ToastService` se inyecta en
 * `roleGuard`, que carga junto al router, eso costaba unos 97 kB en el bundle
 * inicial solo para pintar un div. Para una pila de avisos con animación y
 * cierre por temporizador, un componente propio pesa una fracción de eso.
 */
@Component({
  selector: 'app-toast-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-pila" role="region" aria-label="Notificaciones">
      @for (toast of servicio.toasts(); track toast.id) {
        <div
          class="toast"
          [class]="'toast--' + toast.tipo"
          [attr.role]="toast.tipo === 'error' ? 'alert' : 'status'"
          [attr.aria-live]="toast.tipo === 'error' ? 'assertive' : 'polite'"
        >
          <span class="toast-icono" aria-hidden="true">{{ toast.icono }}</span>
          <span class="toast-mensaje">{{ toast.mensaje }}</span>
          <button
            type="button"
            class="toast-cerrar"
            (click)="servicio.cerrar(toast.id)"
            [attr.aria-label]="'Descartar notificación: ' + toast.mensaje"
          >
            ✕
          </button>
          <span
            class="toast-progreso"
            [style.animation-duration.ms]="toast.duracionMs"
            aria-hidden="true"
          ></span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-pila {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: var(--gs-z-toast, 1100);
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        width: min(24rem, calc(100vw - 2rem));
        pointer-events: none;
      }

      .toast {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: 0.65rem;
        padding: 0.85rem 0.9rem 0.9rem;
        overflow: hidden;
        background: var(--gs-surface, #1e293b);
        border: 1px solid var(--gs-border, #334155);
        border-left: 3px solid var(--gs-info, #38bdf8);
        border-radius: var(--gs-radio-md, 12px);
        box-shadow: var(--gs-sombra-lg, 0 12px 32px -8px rgba(0, 0, 0, 0.65));
        pointer-events: auto;
        animation: toast-entra 380ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .toast--exito {
        border-left-color: var(--gs-exito, #22c55e);
        background:
          linear-gradient(100deg, var(--gs-exito-suave, rgba(34, 197, 94, 0.14)), transparent 55%),
          var(--gs-surface, #1e293b);
      }

      .toast--error {
        border-left-color: var(--gs-error, #ef4444);
        background:
          linear-gradient(100deg, var(--gs-error-suave, rgba(239, 68, 68, 0.14)), transparent 55%),
          var(--gs-surface, #1e293b);
      }

      .toast--aviso {
        border-left-color: var(--gs-aviso, #f59e0b);
        background:
          linear-gradient(100deg, var(--gs-aviso-suave, rgba(245, 158, 11, 0.14)), transparent 55%),
          var(--gs-surface, #1e293b);
      }

      .toast-icono {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.15rem;
        height: 1.15rem;
        border-radius: 50%;
        background: var(--gs-info-suave, rgba(56, 189, 248, 0.14));
        color: var(--gs-text, #f1f5f9);
        font-size: 0.7rem;
        font-weight: 700;
      }

      .toast--exito .toast-icono {
        background: var(--gs-exito, #22c55e);
      }

      .toast--error .toast-icono {
        background: var(--gs-error, #ef4444);
      }

      .toast--aviso .toast-icono {
        background: var(--gs-aviso, #f59e0b);
      }

      .toast-mensaje {
        flex: 1;
        color: var(--gs-text, #f1f5f9);
        font-size: 0.86rem;
        line-height: 1.45;
        word-break: break-word;
      }

      .toast-cerrar {
        flex-shrink: 0;
        width: 1.4rem;
        height: 1.4rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        border-radius: var(--gs-radio-xs, 6px);
        color: var(--gs-text-tenue, #94a3b8);
        font-size: 0.75rem;
        line-height: 1;
      }

      .toast-cerrar:hover {
        background: var(--gs-bg-elevado, #0d121d);
        color: var(--gs-text, #f1f5f9);
      }

      /* La barra de progreso indica cuánto queda sin necesidad de un
         setInterval que vaya descontando tiempo. */
      .toast-progreso {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 2px;
        width: 100%;
        background: currentColor;
        opacity: 0.3;
        transform-origin: left center;
        animation: toast-auge linear forwards;
      }

      @keyframes toast-entra {
        from {
          opacity: 0;
          transform: translateX(28px) scale(0.96);
        }
        to {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }

      @keyframes toast-auge {
        from {
          transform: scaleX(1);
        }
        to {
          transform: scaleX(0);
        }
      }

      @media (max-width: 480px) {
        .toast-pila {
          top: 0.5rem;
          right: 0.5rem;
          left: 0.5rem;
          width: auto;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .toast {
          animation: none;
        }

        .toast-progreso {
          display: none;
        }
      }
    `,
  ],
})
export class ToastContainerComponent {
  protected readonly servicio = inject(ToastService);
}
