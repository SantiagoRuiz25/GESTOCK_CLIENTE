import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MovimientoLogistico {
  id: string;
  fecha: string;
  tipoMovimiento: 'Entrada' | 'Salida' | 'Transferencia';
  producto: string;
  cantidad: number;
  responsable: string;
  destinoOrigen: string;
}

@Component({
  selector: 'app-historial-logistico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-logistico.html',
  styleUrls: ['./historial-logistico.css']
})
export class HistorialLogisticoComponent implements OnInit {

  // Filtros (HU042)
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';
  filtroTipo: string = 'Todos';
  filtroProducto: string = '';
  filtroResponsable: string = '';

  // Lista maestra de movimientos (HU041)
  historialMovimientos: MovimientoLogistico[] = [];

  ngOnInit() {
    const guardados = localStorage.getItem('gestock_historial_logistico');
    if (guardados) {
      try {
        this.historialMovimientos = JSON.parse(guardados);
      } catch (e) {
        console.error('Error al cargar historial logístico', e);
        this.cargarDatosIniciales();
      }
    } else {
      this.cargarDatosIniciales();
    }
  }

  cargarDatosIniciales() {
    this.historialMovimientos = [
      { id: 'LOG-501', fecha: '2026-08-26', tipoMovimiento: 'Entrada', producto: 'Sensor Hidráulico Principal', cantidad: 12, responsable: 'Maicol Nore', destinoOrigen: 'Proveedor Industrial S.A.' },
      { id: 'LOG-502', fecha: '2026-08-25', tipoMovimiento: 'Salida', producto: 'Aceite Lubricante 20L', cantidad: 5, responsable: 'Carlos Pérez', destinoOrigen: 'Línea de Producción 2' },
      { id: 'LOG-503', fecha: '2026-08-24', tipoMovimiento: 'Transferencia', producto: 'Filtro de Aire Compresor', cantidad: 8, responsable: 'Maicol Nore', destinoOrigen: 'Bodega Principal -> Bodega Norte' },
      { id: 'LOG-504', fecha: '2026-08-22', tipoMovimiento: 'Entrada', producto: 'Correas de Transmisión V', cantidad: 20, responsable: 'Ana Gómez', destinoOrigen: 'Ferretería Mecánica Ltda.' },
      { id: 'LOG-505', fecha: '2026-08-20', tipoMovimiento: 'Salida', producto: 'Batería de Respaldo 12V', cantidad: 3, responsable: 'Carlos Pérez', destinoOrigen: 'Subestación Eléctrica B' },
      { id: 'LOG-506', fecha: '2026-08-18', tipoMovimiento: 'Entrada', producto: 'Válvula Solenoidal 24V', cantidad: 15, responsable: 'Maicol Nore', destinoOrigen: 'Global Automation S.A.S.' },
      { id: 'LOG-507', fecha: '2026-08-15', tipoMovimiento: 'Transferencia', producto: 'Rodamientos de Bola 6204', cantidad: 30, responsable: 'Ana Gómez', destinoOrigen: 'Taller Central -> Mantenimiento' },
      { id: 'LOG-508', fecha: '2026-08-12', tipoMovimiento: 'Salida', producto: 'Manguera de Alta Presión', cantidad: 10, responsable: 'Carlos Pérez', destinoOrigen: 'Línea de Empaque' },
      { id: 'LOG-509', fecha: '2026-08-10', tipoMovimiento: 'Entrada', producto: 'Fusibles Cerámicos 10A', cantidad: 50, responsable: 'Maicol Nore', destinoOrigen: 'ElectroComponentes Ltda.' },
      { id: 'LOG-510', fecha: '2026-08-08', tipoMovimiento: 'Transferencia', producto: 'Manómetro de Presión 0-10bar', cantidad: 6, responsable: 'Ana Gómez', destinoOrigen: 'Bodega Norte -> Línea 1' },
      { id: 'LOG-511', fecha: '2026-08-05', tipoMovimiento: 'Salida', producto: 'Grasa Industrial Litio', cantidad: 8, responsable: 'Carlos Pérez', destinoOrigen: 'Sección de Motores' },
    ];
    this.sincronizarStorage();
  }

  sincronizarStorage() {
    localStorage.setItem('gestock_historial_logistico', JSON.stringify(this.historialMovimientos));
  }

  // Propiedad computada para filtrar por rango de fechas, tipo, producto y responsable (HU042)
  get movimientosFiltrados(): MovimientoLogistico[] {
    return this.historialMovimientos.filter(item => {
      // Filtro por rango de fechas (Desde - Hasta)
      let coincideFecha = true;
      if (this.filtroFechaDesde && this.filtroFechaHasta) {
        coincideFecha = item.fecha >= this.filtroFechaDesde && item.fecha <= this.filtroFechaHasta;
      } else if (this.filtroFechaDesde) {
        coincideFecha = item.fecha >= this.filtroFechaDesde;
      } else if (this.filtroFechaHasta) {
        coincideFecha = item.fecha <= this.filtroFechaHasta;
      }

      // Filtro por tipo de movimiento
      const coincideTipo = this.filtroTipo && this.filtroTipo !== 'Todos' 
        ? item.tipoMovimiento === this.filtroTipo 
        : true;

      // Filtro por producto
      const coincideProducto = this.filtroProducto 
        ? item.producto.toLowerCase().includes(this.filtroProducto.toLowerCase()) 
        : true;

      // Filtro por responsable
      const coincideResponsable = this.filtroResponsable && this.filtroResponsable !== 'Todos los usuarios' 
        ? item.responsable === this.filtroResponsable 
        : true;

      return coincideFecha && coincideTipo && coincideProducto && coincideResponsable;
    });
  }

  // Generación de reporte y traza JSON en consola con el botón Exportar (HU043)
  exportarReporte(): void {
    const datosReporte = {
      modulo: 'Historial Logístico (Gestock)',
      generadoPor: 'Maicol Nore',
      fechaGeneracion: new Date().toISOString(),
      totalRegistrosFiltrados: this.movimientosFiltrados.length,
      filtrosAplicados: {
        fechaDesde: this.filtroFechaDesde || 'Sin límite inicial',
        fechaHasta: this.filtroFechaHasta || 'Sin límite final',
        tipoMovimiento: this.filtroTipo,
        producto: this.filtroProducto || 'Ninguno',
        responsable: this.filtroResponsable || 'Ninguno'
      },
      registros: this.movimientosFiltrados
    };

    console.group('%c[GESTOCK] Exportación de Reporte Logístico (JSON)', 'color: #3b82f6; font-weight: bold; font-size: 13px;');
    console.log(JSON.stringify(datosReporte, null, 2));
    console.groupEnd();

    alert('Reporte exportado con éxito. Revise la consola de desarrollo (F12) para ver la estructura JSON generada.');
  }

  limpiarFiltros(): void {
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.filtroTipo = 'Todos';
    this.filtroProducto = '';
    this.filtroResponsable = 'Todos los usuarios';
  }
}