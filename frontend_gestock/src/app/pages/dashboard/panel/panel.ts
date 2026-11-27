import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadisticasService, Empresa } from '../../../services/estadisticas.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel.html',
  styleUrl: './panel.css'
})
export class PanelComponent implements OnInit, OnDestroy {
  private estadisticasService = inject(EstadisticasService);
  private sub$!: Subscription;

  empresaActual: Empresa | null = null;
  mostrarMenuInventario: boolean = false;

  ngOnInit(): void {
    // 1. Nos suscribimos al observable del servicio para detectar cambios al instante
    this.sub$ = this.estadisticasService.empresaActual$.subscribe(empresa => {
      if (empresa && empresa.id) {
        this.empresaActual = empresa;
      } else {
        // 2. Fallback: Si el servicio está vacío (ej. al recargar la página), lo buscamos en localStorage
        this.cargarEmpresaDesdeStorage();
      }
    });
  }

  private cargarEmpresaDesdeStorage() {
    const idSeleccionada = localStorage.getItem('empresaIdSeleccionada');
    const guardadas = localStorage.getItem('gestock_empresas');

    if (guardadas && idSeleccionada) {
      try {
        const empresas = JSON.parse(guardadas);
        const encontrada = empresas.find((e: any) => e.id === idSeleccionada);
        if (encontrada) {
          this.empresaActual = {
            id: encontrada.id,
            nombre: encontrada.nombre,
            email: encontrada.email,
            moneda: encontrada.moneda,
            formatoFecha: encontrada.formatoFecha,
            bodegasActivas: 1,
            totalPrecios: 0,
            valorInventario: 0,
            alertasStock: 0
          };
          // Sincronizamos también el servicio para mantener la consistencia
          this.estadisticasService.cambiarEmpresaActiva(this.empresaActual);
        }
      } catch (e) {
        console.error('Error al leer la empresa del localStorage', e);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.sub$) {
      this.sub$.unsubscribe();
    }
  }

  toggleMenuInventario(event: Event) {
    event.stopPropagation();
    this.mostrarMenuInventario = !this.mostrarMenuInventario;
  }

  cerrarMenu() {
    this.mostrarMenuInventario = false;
  }
}