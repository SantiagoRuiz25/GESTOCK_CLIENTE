import { Component, OnInit, OnDestroy, ChangeDetectorRef, Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auditorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditorias.html',
  styleUrls: ['./auditorias.css']
})
export class AuditoriasComponent implements OnInit, OnDestroy {

  listaAuditorias: any[] = [];
  auditoriaSeleccionada: any = null;
  filtroAccion: string = 'TODOS';
  filtroBusqueda: string = '';
  
  mensajeNotificacion: string | null = null;
  private intervaloActualizacion: any;

  constructor(
    private cdRef: ChangeDetectorRef,
    private renderer: Renderer2,
    private elRef: ElementRef
  ) {}

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
          entidad: 'Producto: Laptop HP ProBook',
          detalles: 'Bodega: Bodega Central | Cantidad: 12 un.',
          fechaHora: 'Aug 26, 2026, 2:39 PM',
          estado: 'Completado',
          jsonDetalle: {
            codigo: 'PROD-001',
            nombre: 'Laptop HP ProBook',
            categoria: 'Tecnología',
            bodega: 'Bodega Central',
            precio: 2500000,
            stock: 12
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

    // Disparar mensaje de éxito flotante de forma inmediata
    this.mostrarNotificacion('¡Reporte de auditoría exportado exitosamente!');
  }

  mostrarNotificacion(mensaje: string) {
    this.mensajeNotificacion = mensaje;
    this.cdRef.detectChanges();
    this.renderizarToastVisual(mensaje);

    setTimeout(() => {
      if (this.mensajeNotificacion === mensaje) {
        this.mensajeNotificacion = null;
        this.cdRef.detectChanges();
        this.removerToastVisual();
      }
    }, 3500);
  }

  private renderizarToastVisual(mensaje: string) {
    let toastContainer = this.elRef.nativeElement.querySelector('.superposicion-modal-superior-dinamico');
    if (!toastContainer) {
      toastContainer = this.renderer.createElement('div');
      this.renderer.addClass(toastContainer, 'superposicion-modal-superior-dinamico');
      this.renderer.addClass(toastContainer, 'animate-slide-up');
      
      const tarjeta = this.renderer.createElement('div');
      this.renderer.addClass(tarjeta, 'tarjeta-aviso-superior');
      
      const icono = this.renderer.createElement('div');
      this.renderer.addClass(icono, 'icono-aviso-grande');
      icono.innerHTML = '✨';
      
      const contenido = this.renderer.createElement('div');
      this.renderer.addClass(contenido, 'cabecera-aviso-superior');
      
      const titulo = this.renderer.createElement('h3');
      titulo.innerText = 'Notificación del Sistema';
      
      const texto = this.renderer.createElement('p');
      this.renderer.setAttribute(texto, 'id', 'texto-mensaje-dinamico');
      texto.innerText = mensaje;
      
      this.renderer.appendChild(contenido, titulo);
      this.renderer.appendChild(contenido, texto);
      this.renderer.appendChild(tarjeta, icono);
      this.renderer.appendChild(tarjeta, contenido);
      this.renderer.appendChild(toastContainer, tarjeta);
      this.renderer.appendChild(this.elRef.nativeElement, toastContainer);
    } else {
      const textoEl = toastContainer.querySelector('#texto-mensaje-dinamico');
      if (textoEl) textoEl.innerText = mensaje;
    }
  }

  private removerToastVisual() {
    const toastContainer = this.elRef.nativeElement.querySelector('.superposicion-modal-superior-dinamico');
    if (toastContainer) {
      this.renderer.removeChild(this.elRef.nativeElement, toastContainer);
    }
  }

  verDetalleAuditoria(item: any) {
    this.auditoriaSeleccionada = item;
    document.body.style.overflow = 'hidden';

    console.log("=== JSON DETALLE DE AUDITORÍA SELECCIONADA ===");
    console.log(JSON.stringify(item, null, 2));
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