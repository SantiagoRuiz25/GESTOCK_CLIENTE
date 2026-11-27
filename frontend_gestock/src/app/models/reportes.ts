export interface KpiResumen {
  valorTotal: number;
  costeTotal: number;
  margenGanancia: number;
  porcentajeMargen: number;
}

export interface CategoriaReporte {
  nombre: string;
  cantidadProductos: number;
  totalValor: number;
  porcentaje: number;
  colorHex: string;
}

export interface ProductoMovimiento {
  nombre: string;
  sku: string;
  entradas: number;
  salidas: number;
  balance: number;
}

export interface MovimientosResumen {
  totalEntradas: number;
  totalSalidas: number;
}

export interface BodegaReporte {
  id: number;
  nombre: string;
  estado?: 'Activa' | 'Inactiva';
  valorTotal: number;
  cantidadProductos: number;
  porcentajeValorTotal: number;
  ubicacion?: string;
}

export interface BodegaReporte {
  id: number;
  nombre: string;
  estado?: 'Activa' | 'Inactiva';
  valorTotal: number;
  cantidadProductos: number;
  porcentajeValorTotal: number;
  ubicacion?: string;
  // Campos para el detalle expandible
  responsable?: string;
  direccion?: string;
  capacidadOcupada?: number; // Ej: 85 (%)
  topProductos?: { nombre: string; stock: number; valor: number }[];
}