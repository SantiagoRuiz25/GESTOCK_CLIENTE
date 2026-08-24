import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Movimiento {
  fecha: string;
  tipo: 'Entrada' | 'Salida';
  producto: string;
  cantidad: string;
  responsable: string;
}

@Component({
  selector: 'app-historial-logistico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-logistico.html',
  styleUrls: ['./historial-logistico.css']
})
export class HistorialLogisticoComponent {

  // Variables para filtros (HU042)
  filtroFecha: string = '';
  filtroResponsable: string = '';

  // Data completa de movimientos
  movimientos: Movimiento[] = [
    { fecha: '2026-08-24', tipo: 'Entrada', producto: 'Disco Duro Externo 1TB', cantidad: '+50', responsable: 'Maicol Nore [Gerente]' },
    { fecha: '2026-08-24', tipo: 'Salida', producto: 'Mouse Inalámbrico Logitech', cantidad: '-12', responsable: 'Erick Ruiz [Operador]' },
    { fecha: '2026-08-23', tipo: 'Entrada', producto: 'Teclado Mecánico RGB', cantidad: '+30', responsable: 'Maicol Nore [Gerente]' }
  ];

  // Propiedad computada o filtrada para la tabla (HU042)
  get movimientosFiltrados() {
    return this.movimientos.filter(m => {
      const coincideFecha = this.filtroFecha ? m.fecha === this.filtroFecha : true;
      const coincideResponsable = this.filtroResponsable ? m.responsable.includes(this.filtroResponsable) : true;
      return coincideFecha && coincideResponsable;
    });
  }

  // Generar reporte del historial (HU043)
  generarReporteHistorial(): void {
    alert(`Exportando reporte de historial logístico con ${this.movimientosFiltrados.length} registros aplicados...`);
  }
}