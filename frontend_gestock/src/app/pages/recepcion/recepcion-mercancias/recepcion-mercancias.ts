import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RecepcionItem {
  id: string;
  producto: string;
  cantidad: number;
  proveedor: string;
  tipo: 'ENTRADA' | 'SALIDA';
  estado: 'Validado' | 'Discrepancia';
}

@Component({
  selector: 'app-recepcion-mercancias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recepcion-mercancias.html',
  styleUrls: ['./recepcion-mercancias.css']
})
export class RecepcionMercanciasComponent implements OnInit {
  
  filtroTipo: string = 'TODOS';
  filtroEstado: string = 'TODOS';
  listaRecepciones: RecepcionItem[] = [];

  ngOnInit() {
    this.generarDatosMultinacional();
  }

  generarDatosMultinacional() {
    const productosBase = [
      'Laptop Enterprise 15" i7', 'Servidor Rack 2U Xeon', 'Switch Core 24 Puertos',
      'Monitor UltraWide 34"', 'Teclado Mecánico RGB Pro', 'Mouse Óptico Ergonómico',
      'Disco Duro NVMe 2TB', 'Memoria RAM 32GB DDR5', 'Firewall de Red Hardware',
      'Impresora Láser Industrial', 'Tablet Corporativa 10"', 'Docking Station USB-C'
    ];

    const actoresBase = [
      'Global Logistics Corp.', 'TechSupply International', 'Logistica Andina S.A.',
      'Apex Distribution Inc.', 'Pacific Global Freight', 'Nexus Supply Chain',
      'Centro de Distribución Norte', 'Sucursal Bogotá Hub'
    ];

    const tiposMovimiento: ('ENTRADA' | 'SALIDA')[] = ['ENTRADA', 'SALIDA'];
    const estadosPosibles: ('Validado' | 'Discrepancia')[] = ['Validado', 'Validado', 'Validado', 'Discrepancia'];

    for (let i = 1; i <= 105; i++) {
      const prodAleatorio = productosBase[Math.floor(Math.random() * productosBase.length)];
      const actorAleatorio = actoresBase[Math.floor(Math.random() * actoresBase.length)];
      const tipoAleatorio = tiposMovimiento[Math.floor(Math.random() * tiposMovimiento.length)];
      const estadoAleatorio = estadosPosibles[Math.floor(Math.random() * estadosPosibles.length)];
      const cantidadAleatoria = Math.floor(Math.random() * 250) + 10;
      const numeroOrden = 8000 + i;

      this.listaRecepciones.push({
        id: tipoAleatorio === 'ENTRADA' ? `OC-2026-${numeroOrden}` : `OUT-2026-${numeroOrden}`,
        producto: `${prodAleatorio} (Lote #${i})`,
        cantidad: cantidadAleatoria,
        proveedor: actorAleatorio,
        tipo: tipoAleatorio,
        estado: estadoAleatorio
      });
    }
  }

  // Filtro combinado (Tipo + Estado)
  get recepcionesFiltradas(): RecepcionItem[] {
    return this.listaRecepciones.filter(item => {
      const cumpleTipo = this.filtroTipo === 'TODOS' || item.tipo === this.filtroTipo;
      const cumpleEstado = this.filtroEstado === 'TODOS' || item.estado === this.filtroEstado;
      return cumpleTipo && cumpleEstado;
    });
  }

  filtrarPorTipo(tipo: string) {
    this.filtroTipo = tipo;
  }

  generarInforme(item: RecepcionItem) {
    alert(`Visualizando detalle del movimiento corporativo:\nTipo: ${item.tipo}\nReferencia: ${item.id}\nProducto: ${item.producto}\nEstado: ${item.estado}`);
  }
}