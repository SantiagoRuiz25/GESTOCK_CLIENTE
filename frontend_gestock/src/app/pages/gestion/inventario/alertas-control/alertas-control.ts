import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auditorias', // o app-alertas-control según tu selector actual
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alertas-control.html',
  styleUrls: ['./alertas-control.css']
})
export class AlertasControlComponent implements OnInit {
  auditorias: any[] = [];
  filtroBusqueda: string = '';
  filtroAccion: string = '';
  isLoading: boolean = false;

  ngOnInit(): void {
    this.cargarAuditorias();
  }

  // 🔹 Carga los registros de auditoría desde el localStorage de forma dinámica
  cargarAuditorias(): void {
    this.isLoading = true;
    
    setTimeout(() => {
      // Obtenemos los registros reales guardados al crear productos u otras acciones
      const registrosGuardados = JSON.parse(localStorage.getItem('sistema_auditorias') || '[]');
      
      // Si no hay registros previos, inicializamos con algunos por defecto o vacío
      if (registrosGuardados.length === 0) {
        const iniciales = [
          { id: '#1', usuario: 'Administrador', accion: 'CREAR', entidad: 'Inventario / Producto', detalles: 'Bodega Principal Yopal', fechaHora: 'Aug 25, 2026, 1:46:39 PM', estado: 'Completado' },
          { id: '#2', usuario: 'Carlos Pérez', accion: 'ACTUALIZAR', entidad: 'Bodega Central', detalles: 'Modificación de stock', fechaHora: 'Aug 25, 2026, 12:46:39 PM', estado: 'Completado' },
          { id: '#3', usuario: 'Ana Gómez', accion: 'ELIMINAR', entidad: 'Roles y Usuarios', detalles: 'Baja de usuario', fechaHora: 'Aug 25, 2026, 11:46:39 PM', estado: 'Completado' }
        ];
        localStorage.setItem('sistema_auditorias', JSON.stringify(iniciales));
        this.auditorias = iniciales;
      } else {
        this.auditorias = registrosGuardados;
      }

      this.isLoading = false;
    }, 200);
  }

  // 🔹 Filtrado dinámico por usuario o entidad
  get auditoriasFiltradas(): any[] {
    return this.auditorias.filter(item => {
      const textoCoincide = 
        item.usuario.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        item.entidad.toLowerCase().includes(this.filtroBusqueda.toLowerCase());
      
      const accionCoincide = this.filtroAccion ? item.accion === this.filtroAccion : true;

      return textoCoincide && accionCoincide;
    });
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroAccion = '';
  }
}