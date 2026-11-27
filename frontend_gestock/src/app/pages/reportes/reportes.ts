import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  KpiResumen, 
  CategoriaReporte, 
  ProductoMovimiento, 
  MovimientosResumen,
  BodegaReporte 
} from '../../models/reportes';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css']
})
export class ReportesComponent implements OnInit {
  tabActiva: 'inventarios' | 'movimientos' | 'bodega' = 'inventarios';

  // Control de interfaz
  bodegaExpandidaId: number | null = null;
  mostrarModalConfirmacion: boolean = false;

  // Datos
  kpis: KpiResumen = {
    valorTotal: 52496,
    costeTotal: 34436,
    margenGanancia: 18060,
    porcentajeMargen: 34.4
  };

  categorias: CategoriaReporte[] = [
    { nombre: 'Electrónica', cantidadProductos: 8, totalValor: 34259, porcentaje: 63.4, colorHex: '#007bff' },
    { nombre: 'Mobiliario', cantidadProductos: 4, totalValor: 7710, porcentaje: 14.7, colorHex: '#ffc107' },
    { nombre: 'Periférico', cantidadProductos: 4, totalValor: 7369, porcentaje: 14.0, colorHex: '#28a745' },
    { nombre: 'Herramientas', cantidadProductos: 2, totalValor: 1372, porcentaje: 4.4, colorHex: '#dc3545' },
    { nombre: 'Limpieza', cantidadProductos: 1, totalValor: 828, porcentaje: 1.6, colorHex: '#9c27b0' }
  ];

  movimientosKpi: MovimientosResumen = {
    totalEntradas: 130,
    totalSalidas: 25
  };

  productosMovimiento: ProductoMovimiento[] = [
    { nombre: 'Resma de Papel A4 500h', sku: 'PAPEL-A4-500', entradas: 100, salidas: 0, balance: 100 },
    { nombre: 'Batería Portátil 20000mAh', sku: 'BAT-POR-20K', entradas: 20, salidas: 0, balance: 20 },
    { nombre: 'Mouse Inalámbrico Logitech', sku: 'MOU-LOG-001', entradas: 0, salidas: 12, balance: -12 },
    { nombre: 'Laptop Dell Inspiron 15', sku: 'LAP-DEL-001', entradas: 0, salidas: 5, balance: -5 }
  ];

  bodegas: BodegaReporte[] = [
    { 
      id: 1, 
      nombre: 'Bodega Principal', 
      ubicacion: 'Zona Norte', 
      estado: 'Activa', 
      cantidadProductos: 120, 
      valorTotal: 32500, 
      porcentajeValorTotal: 61.9,
      responsable: 'Carlos Mendoza',
      direccion: 'Calle 10 # 15-30, Zona Industrial',
      capacidadOcupada: 78,
      topProductos: [
        { nombre: 'Laptop Dell Inspiron 15', stock: 15, valor: 12500 },
        { nombre: 'Monitor LG 27"', stock: 30, valor: 9000 },
        { nombre: 'Teclado Mecánico RGB', stock: 45, valor: 4500 }
      ]
    },
    { 
      id: 2, 
      nombre: 'Bodega Secundaria', 
      ubicacion: 'Zona Sur', 
      estado: 'Activa', 
      cantidadProductos: 45, 
      valorTotal: 12000, 
      porcentajeValorTotal: 22.8,
      responsable: 'Ana María Gómez',
      direccion: 'Carrera 40 # 22-05',
      capacidadOcupada: 42,
      topProductos: [
        { nombre: 'Escritorio Ergonómico', stock: 10, valor: 6000 },
        { nombre: 'Silla de Oficina Ejecutiva', stock: 12, valor: 4200 }
      ]
    },
    { 
      id: 3, 
      nombre: 'Almacén Central', 
      ubicacion: 'Centro', 
      estado: 'Activa', 
      cantidadProductos: 25, 
      valorTotal: 7996, 
      porcentajeValorTotal: 15.3,
      responsable: 'Jorge Luis Pérez',
      direccion: 'Avenida Bolivar # 8-12',
      capacidadOcupada: 25,
      topProductos: [
        { nombre: 'Resma de Papel A4', stock: 200, valor: 1500 },
        { nombre: 'Toner Impresora HP', stock: 15, valor: 3200 }
      ]
    }
  ];

  ngOnInit(): void {}

  cambiarTab(tab: 'inventarios' | 'movimientos' | 'bodega'): void {
    this.tabActiva = tab;
  }

  toggleDetalleBodega(id: number): void {
    this.bodegaExpandidaId = this.bodegaExpandidaId === id ? null : id;
  }

  // --- LÓGICA DEL MODAL Y EXPORTACIÓN ---
  abrirModalConfirmacion(): void {
    this.mostrarModalConfirmacion = true;
  }

  cerrarModalConfirmacion(): void {
    this.mostrarModalConfirmacion = false;
  }

  confirmarYDescargarPDF(): void {
    this.cerrarModalConfirmacion();
    this.generarPDFReporte();
  }

  private generarPDFReporte(): void {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString('es-ES');

    // Encabezado
    doc.setFillColor(19, 21, 39); // #131527
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('GESTOCK - Reporte de Inventario', 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${fecha}`, 160, 18);

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Reporte Activo: ${this.tabActiva.toUpperCase()}`, 14, 40);

    // Tabla de Bodegas / Contenido
    if (this.tabActiva === 'bodega') {
      const rows: any[] = [];
      this.bodegas.forEach(b => {
        rows.push([
          b.nombre,
          b.ubicacion,
          b.responsable || 'N/A',
          `${b.cantidadProductos} unds`,
          `$${b.valorTotal.toLocaleString()}`,
          `${b.capacidadOcupada || 0}%`
        ]);
      });

      autoTable(doc, {
        startY: 48,
        head: [['Bodega', 'Ubicación', 'Responsable', 'Productos', 'Valor Total', 'Ocupación']],
        body: rows,
        headStyles: { fillColor: [58, 134, 255] },
        theme: 'grid'
      });
    } else if (this.tabActiva === 'inventarios') {
      const rows = this.categorias.map(c => [
        c.nombre,
        `${c.cantidadProductos} productos`,
        `$${c.totalValor.toLocaleString()}`,
        `${c.porcentaje}%`
      ]);

      autoTable(doc, {
        startY: 48,
        head: [['Categoría', 'Cantidad', 'Valor Total', 'Porcentaje']],
        body: rows,
        headStyles: { fillColor: [58, 134, 255] },
        theme: 'grid'
      });
    } else {
      const rows = this.productosMovimiento.map(p => [
        p.nombre,
        p.sku,
        p.entradas,
        p.salidas,
        p.balance
      ]);

      autoTable(doc, {
        startY: 48,
        head: [['Producto', 'SKU', 'Entradas', 'Salidas', 'Balance']],
        body: rows,
        headStyles: { fillColor: [58, 134, 255] },
        theme: 'grid'
      });
    }

    // Pie de página
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${pageCount} - Generado automáticamente por Gestock`, 14, 285);
    }

    doc.save(`Gestock_Reporte_${this.tabActiva}_${Date.now()}.pdf`);
  }
}