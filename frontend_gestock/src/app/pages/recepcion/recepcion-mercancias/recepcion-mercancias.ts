import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RecepcionItem {
  id: string;
  fecha: string;
  sku: string;
  producto: string;
  cantidad: number;
  tipo: 'ENTRADA' | 'SALIDA';
  motivo: string;
  responsable: string;
  observaciones: string;
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

  menuAccionesAbierto: boolean = false;
  modalActivo: boolean = false;
  modalTitulo: string = '';

  nuevoItem: RecepcionItem = {
    id: '',
    fecha: '',
    sku: '',
    producto: '',
    cantidad: 1,
    tipo: 'ENTRADA',
    motivo: 'Compra',
    responsable: '',
    observaciones: '',
    estado: 'Validado'
  };

  ngOnInit() {
    const datosGuardados = localStorage.getItem('gestock_movimientos');
    if (datosGuardados) {
      try {
        this.listaRecepciones = JSON.parse(datosGuardados);
      } catch (e) {
        console.error('Error al parsear localStorage:', e);
        this.generarDatosMultinacional();
      }
    } else {
      this.generarDatosMultinacional();
    }
  }

  generarDatosMultinacional() {
    const productosBase = [
      { sku: 'SKU-LP-01', desc: 'Laptop Enterprise 15" i7' },
      { sku: 'SKU-SR-02', desc: 'Servidor Rack 2U Xeon' },
      { sku: 'SKU-SW-03', desc: 'Switch Core 24 Puertos' },
      { sku: 'SKU-MN-04', desc: 'Monitor UltraWide 34"' },
      { sku: 'SKU-TC-05', desc: 'Teclado Mecánico RGB Pro' }
    ];
    const motivos = ['Compra', 'Venta', 'Devolución', 'Transferencia', 'Ajuste'];
    const responsables = ['Carlos Mendoza', 'Ana María Gómez', 'Luis Fernando Díaz', 'Diana Sofía R.', 'Roberto Carlos Pérez'];
    const tipos: ('ENTRADA' | 'SALIDA')[] = ['ENTRADA', 'SALIDA'];
    const estados: ('Validado' | 'Discrepancia')[] = ['Validado', 'Validado', 'Discrepancia'];

    for (let i = 1; i <= 15; i++) {
      const p = productosBase[Math.floor(Math.random() * productosBase.length)];
      const tipo = tipos[Math.floor(Math.random() * tipos.length)];
      const estado = estados[Math.floor(Math.random() * estados.length)];
      const motivo = motivos[Math.floor(Math.random() * motivos.length)];
      const resp = responsables[Math.floor(Math.random() * responsables.length)];

      this.listaRecepciones.push({
        id: `MOV-2026-${8000 + i}`,
        fecha: `2026-08-25 ${String(Math.floor(Math.random() * 10) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        sku: p.sku,
        producto: `${p.desc} (Lote #${i})`,
        cantidad: Math.floor(Math.random() * 100) + 5,
        tipo: tipo,
        motivo: motivo,
        responsable: resp,
        observaciones: `Factura/Remisión #FAC-${9000 + i} - OK`,
        estado: estado
      });
    }
    this.sincronizarStorage();
  }

  sincronizarStorage() {
    localStorage.setItem('gestock_movimientos', JSON.stringify(this.listaRecepciones));
  }

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

  toggleMenuAcciones() {
    this.menuAccionesAbierto = !this.menuAccionesAbierto;
  }

  abrirFormulario(tipo: 'ENTRADA' | 'SALIDA') {
    this.menuAccionesAbierto = false;
    const ahora = new Date();
    const fechaStr = ahora.toISOString().slice(0, 10) + ' ' + ahora.toTimeString().slice(0, 5);
    
    this.nuevoItem = {
      id: tipo === 'ENTRADA' ? `IN-2026-${Math.floor(Math.random() * 900) + 1000}` : `OUT-2026-${Math.floor(Math.random() * 900) + 1000}`,
      fecha: fechaStr,
      sku: '',
      producto: '',
      cantidad: 1,
      tipo: tipo,
      motivo: tipo === 'ENTRADA' ? 'Compra' : 'Venta',
      responsable: '',
      observaciones: '',
      estado: 'Validado'
    };
    this.modalTitulo = tipo === 'ENTRADA' ? 'Registrar Nueva Entrada de Mercancía' : 'Registrar Nuevo Despacho / Salida';
    this.modalActivo = true;
  }

  cerrarModal() {
    this.modalActivo = false;
  }

  guardarMovimiento() {
    if (!this.nuevoItem.sku || !this.nuevoItem.producto || !this.nuevoItem.responsable) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }

    this.listaRecepciones.unshift({ ...this.nuevoItem });

    this.sincronizarStorage();

    console.log('%c[GESTOCK] Nuevo Movimiento Registrado (JSON):', 'color: #38bdf8; font-weight: bold;');
    console.log(JSON.stringify(this.nuevoItem, null, 2));

    this.modalActivo = false;
  }

  generarInforme(item: RecepcionItem) {
    console.log('%c[GESTOCK] Detalle del movimiento seleccionado:', 'color: #34d399; font-weight: bold;');
    console.log(JSON.stringify(item, null, 2));
    alert(`Detalle impreso en consola:\nSKU: ${item.sku}\nProducto: ${item.producto}`);
  }
}