import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auditorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditorias.html',
  styleUrls: ['./auditorias.css']
})
export class AuditoriasComponent {
  logsOriginales = [
    { id: 1, usuario: 'Administrador', accion: 'CREAR', entidad: 'Inventario / Producto', fecha: new Date(), tipo: 'CREAR' },
    { id: 2, usuario: 'Carlos Pérez', accion: 'ACTUALIZAR', entidad: 'Bodega Central', fecha: new Date(Date.now() - 3600000), tipo: 'ACTUALIZAR' },
    { id: 3, usuario: 'Ana Gómez', accion: 'ELIMINAR', entidad: 'Roles y Usuarios', fecha: new Date(Date.now() - 7200000), tipo: 'ELIMINAR' }
  ];

  logsFiltrados = signal(this.logsOriginales);
  filtroTexto = '';
  filtroAccion = '';
  totalLogs = signal(this.logsOriginales.length);
  accionesExitosas = signal(this.logsOriginales.length);

  filtrarLogs() {
    let resultado = this.logsOriginales;
    if (this.filtroTexto) {
      const texto = this.filtroTexto.toLowerCase();
      resultado = resultado.filter(l => l.usuario.toLowerCase().includes(texto) || l.entidad.toLowerCase().includes(texto));
    }
    if (this.filtroAccion) {
      resultado = resultado.filter(l => l.accion === this.filtroAccion);
    }
    this.logsFiltrados.set(resultado);
  }

  limpiarFiltros() {
    this.filtroTexto = '';
    this.filtroAccion = '';
    this.logsFiltrados.set(this.logsOriginales);
  }

  exportarLogs() {
    alert('¡Reporte de auditoría exportado con éxito!');
  }
}