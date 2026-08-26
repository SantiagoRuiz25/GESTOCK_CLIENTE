import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-alertas-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alertas-control.html',
  styleUrls: ['./alertas-control.css']
})
export class AlertasControlComponent implements OnInit, OnDestroy {

  listaAuditorias: any[] = [];
  auditoriaSeleccionada: any = null;
  filtroAccion: string = 'TODOS';
  filtroBusqueda: string = '';

  private intervaloActualizacion: any;

  ngOnInit() {
    this.cargarAuditorias();
    this.intervaloActualizacion = setInterval(() => {
      this.cargarAuditoriasSilencioso();
    }, 4000);
  }

  ngOnDestroy() {
    if (this.intervaloActualizacion) {
      clearInterval(this.intervaloActualizacion);
    }
  }

  cargarAuditorias() {
    const datos = localStorage.getItem('sistema_auditorias');
    if (!datos) {
      const auditoriasIniciales = [
        {
          id: '#1',
          usuario: 'Administrador',
          accion: 'CREAR',
          entidad: 'Inventario / Producto',
          detalles: 'Se creó el producto Laptop HP ProBook en Bodega Central',
          fechaHora: 'Aug 26, 2026, 2:39:34 PM',
          estado: 'Completado',
          jsonDetalle: {
            codigo: 'PROD-001',
            nombreProducto: 'Laptop HP ProBook',
            categoria: 'Tecnología',
            precio: 2500000,
            stockInicial: 12,
            bodega: 'Bodega Central',
            responsable: 'Administrador'
          }
        },
        {
          id: '#2',
          usuario: 'Carlos Pérez',
          accion: 'ACTUALIZAR',
          entidad: 'Bodega Central',
          detalles: 'Se actualizó el stock del producto Mouse Logitech (40 -> 45 un.)',
          fechaHora: 'Aug 26, 2026, 1:39:34 PM',
          estado: 'Completado',
          jsonDetalle: {
            codigo: 'PROD-002',
            nombreProducto: 'Mouse Inalámbrico Logitech',
            stockAnterior: 40,
            stockNuevo: 45,
            motivo: 'Recepción de proveedor',
            responsable: 'Carlos Pérez'
          }
        },
        {
          id: '#3',
          usuario: 'Ana Gómez',
          accion: 'ELIMINAR',
          entidad: 'Roles y Usuarios',
          detalles: 'Se eliminó el registro de producto obsoleto Impresora Láser',
          fechaHora: 'Aug 26, 2026, 12:39:34 PM',
          estado: 'Completado',
          jsonDetalle: {
            codigo: 'PROD-999',
            nombreProducto: 'Impresora Láser Antigua',
            motivoBaja: 'Producto descontinuado del catálogo',
            responsable: 'Ana Gómez'
          }
        }
      ];
      localStorage.setItem('sistema_auditorias', JSON.stringify(auditoriasIniciales));
      this.listaAuditorias = auditoriasIniciales;
    } else {
      try {
        this.listaAuditorias = JSON.parse(datos);
      } catch (e) {
        this.listaAuditorias = [];
      }
    }
  }

  cargarAuditoriasSilencioso() {
    const datos = localStorage.getItem('sistema_auditorias');
    if (datos) {
      try {
        const parsed = JSON.parse(datos);
        if (parsed.length !== this.listaAuditorias.length) {
          this.listaAuditorias = parsed;
        }
      } catch (e) {}
    }
  }

  get auditoriasFiltradas(): any[] {
    return this.listaAuditorias.filter(item => {
      const cumpleFiltroAccion = this.filtroAccion === 'TODOS' || item.accion === this.filtroAccion;
      const texto = this.filtroBusqueda.toLowerCase().trim();
      const cumpleBusqueda = !texto || 
        (item.usuario && item.usuario.toLowerCase().includes(texto)) ||
        (item.entidad && item.entidad.toLowerCase().includes(texto)) ||
        (item.detalles && item.detalles.toLowerCase().includes(texto));

      return cumpleFiltroAccion && cumpleBusqueda;
    });
  }

  contarExitosas(): number {
    return this.listaAuditorias.filter(i => i.estado === 'Completado').length;
  }

  limpiarFiltros() {
    this.filtroBusqueda = '';
    this.filtroAccion = 'TODOS';
  }

  exportarReporte() {
    const jsonStr = JSON.stringify(this.listaAuditorias, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-auditoria-gestock-${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  verDetalleAuditoria(item: any) {
    this.auditoriaSeleccionada = item;
    document.body.style.overflow = 'hidden';
  }

  cerrarModalDetalle() {
    this.auditoriaSeleccionada = null;
    document.body.style.overflow = 'auto';
  }

  obtenerClaseAccion(accion: string): string {
    switch (accion) {
      case 'CREAR': return 'badge-crear';
      case 'ACTUALIZAR': return 'badge-actualizar';
      case 'ELIMINAR': return 'badge-eliminar';
      default: return 'badge-default';
    }
  }
}