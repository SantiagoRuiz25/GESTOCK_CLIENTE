import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
  private route = inject(ActivatedRoute);
  private estadisticasService = inject(EstadisticasService);
  private sub$!: Subscription;

  empresaId: string | null = null;
  
  // Objeto para almacenar la empresa actual activa
  empresaActual!: Empresa;
  
  // Variables para el menú del inventario que usa panel.html
  mostrarMenuInventario: boolean = false;

  ngOnInit(): void {
    // Captura el ID de la empresa enviada por la URL si aplica
    this.empresaId = this.route.snapshot.paramMap.get('id');
    
    if (this.empresaId) {
      console.log('Mostrando información para la empresa con ID:', this.empresaId);
    }

    // Suscripción al servicio para actualizar los datos de la empresa y contadores en tiempo real
    this.sub$ = this.estadisticasService.empresaActual$.subscribe(empresa => {
      this.empresaActual = empresa;
    });
  }

  ngOnDestroy(): void {
    if (this.sub$) {
      this.sub$.unsubscribe();
    }
  }

  // Métodos que reclama panel.html
  toggleMenuInventario(event: Event) {
    event.stopPropagation();
    this.mostrarMenuInventario = !this.mostrarMenuInventario;
  }

  cerrarMenu() {
    this.mostrarMenuInventario = false;
  }
}