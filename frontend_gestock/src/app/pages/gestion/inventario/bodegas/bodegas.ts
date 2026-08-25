import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

interface ProductoBodega {
  id: string;
  nombre: string;
  sku: string;
  categoria: string;
  cantidad: number;
}

interface Bodega {
  id: number;
  nombre: string;
  codigo: string;
  ciudad: string;
  direccion: string;
  responsable: string;
  telefono: string;
  capacidad: number;
  ocupado: number;
  activa: boolean;
  icono: string;
  productos?: ProductoBodega[];
}

@Component({
  selector: 'app-bodegas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bodegas.html',
  styleUrls: ['./bodegas.css']
})
export class BodegasComponent {
  mostrarModal = signal(false);
  mostrarModalDetalle = signal(false);
  bodegaSeleccionada = signal<Bodega | null>(null);

  // Objeto vinculado al formulario de nueva bodega
  nuevaBodega = {
    nombre: '',
    codigo: '',
    ciudad: '',
    direccion: '',
    responsable: '',
    telefono: '',
    capacidad: 0
  };

  // Las 15 bodegas completas
  bodegas = signal<Bodega[]>([
    {
      id: 1,
      nombre: 'Bodega Principal Yopal',
      codigo: 'BOD-001',
      ciudad: 'Yopal',
      direccion: 'Calle 24 # 15-40',
      responsable: 'Carlos Pérez',
      telefono: '3101234567',
      capacidad: 10000,
      ocupado: 8500,
      activa: true,
      icono: '🏢',
      productos: [
        { id: 'p1', nombre: 'Laptop Lenovo ThinkPad', sku: 'LAP-001', categoria: 'Tecnología', cantidad: 3500 },
        { id: 'p2', nombre: 'Silla Ergonómica Ejecutiva', sku: 'MUE-042', categoria: 'Mobiliario', cantidad: 3000 },
        { id: 'p3', nombre: 'Kit de Redes UTP Cat6', sku: 'RED-109', categoria: 'Accesorios', cantidad: 2000 }
      ]
    },
    {
      id: 2,
      nombre: 'Centro Logístico Medellín',
      codigo: 'BOD-002',
      ciudad: 'Medellín',
      direccion: 'Cra. 50 # 12-30',
      responsable: 'Ana Gómez',
      telefono: '3209876543',
      capacidad: 8000,
      ocupado: 3200,
      activa: true,
      icono: '🏭',
      productos: [
        { id: 'p4', nombre: 'Estantería Metálica Industrial', sku: 'EST-012', categoria: 'Almacenamiento', cantidad: 3200 }
      ]
    },
    {
      id: 3,
      nombre: 'Bodega Bogotá Norte',
      codigo: 'BOD-003',
      ciudad: 'Bogotá',
      direccion: 'Autopista Norte # 180-20',
      responsable: 'Luis Torres',
      telefono: '3114567890',
      capacidad: 15000,
      ocupado: 12000,
      activa: true,
      icono: '📦',
      productos: [
        { id: 'p5', nombre: 'Pallets de Madera Tratada', sku: 'PAL-005', categoria: 'Logística', cantidad: 12000 }
      ]
    },
    {
      id: 4,
      nombre: 'Depósito Cali Sur',
      codigo: 'BOD-004',
      ciudad: 'Cali',
      direccion: 'Calle 5 # 70-12',
      responsable: 'María Rodríguez',
      telefono: '3157891234',
      capacidad: 9000,
      ocupado: 4500,
      activa: true,
      icono: '🏬',
      productos: [
        { id: 'p6', nombre: 'Cajas de Cartón Corrugado', sku: 'CAJ-010', categoria: 'Empaque', cantidad: 4500 }
      ]
    },
    {
      id: 5,
      nombre: 'Bodega Barranquilla Portuaria',
      codigo: 'BOD-005',
      ciudad: 'Barranquilla',
      direccion: 'Vía 40 # 73-100',
      responsable: 'Jorge Eliécer Gaitán',
      telefono: '3009871122',
      capacidad: 20000,
      ocupado: 18500,
      activa: true,
      icono: '⚓',
      productos: [
        { id: 'p7', nombre: 'Contenedores Plásticos Industriales', sku: 'CONT-99', categoria: 'Almacenamiento', cantidad: 18500 }
      ]
    },
    {
      id: 6,
      nombre: 'Almacén Bucaramanga',
      codigo: 'BOD-006',
      ciudad: 'Bucaramanga',
      direccion: 'Carrera 27 # 45-12',
      responsable: 'Sandra Milena',
      telefono: '3182233445',
      capacidad: 6000,
      ocupado: 2100,
      activa: true,
      icono: '🏢',
      productos: [
        { id: 'p8', nombre: 'Cinta de Embalaje Industrial', sku: 'CIN-01', categoria: 'Empaque', cantidad: 2100 }
      ]
    },
    {
      id: 7,
      nombre: 'Bodega Villavicencio',
      codigo: 'BOD-007',
      ciudad: 'Villavicencio',
      direccion: 'Anillo Vial # 12-50',
      responsable: 'Camilo Rincón',
      telefono: '3216549870',
      capacidad: 7500,
      ocupado: 5000,
      activa: true,
      icono: '🚜',
      productos: [
        { id: 'p9', nombre: 'Lubricantes y Aceites para Maquinaria', sku: 'LUB-40', categoria: 'Químicos', cantidad: 5000 }
      ]
    },
    {
      id: 8,
      nombre: 'Depósito Pereira',
      codigo: 'BOD-008',
      ciudad: 'Pereira',
      direccion: 'Zona Industrial La Julita',
      responsable: 'Diana Patricia',
      telefono: '3134455667',
      capacidad: 8500,
      ocupado: 1000,
      activa: false,
      icono: '🏭',
      productos: []
    },
    {
      id: 9,
      nombre: 'Bodega Manizales',
      codigo: 'BOD-009',
      ciudad: 'Manizales',
      direccion: 'Km 3 vía Magdalena',
      responsable: 'Esteban Ospina',
      telefono: '3109988776',
      capacidad: 5000,
      ocupado: 4800,
      activa: true,
      icono: '📦',
      productos: [
        { id: 'p10', nombre: 'Epp y Guantes de Cabritilla', sku: 'EPP-02', categoria: 'Seguridad', cantidad: 4800 }
      ]
    },
    {
      id: 10,
      nombre: 'Centro Logístico Cartagena',
      codigo: 'BOD-010',
      ciudad: 'Cartagena',
      direccion: 'Barrio Manga Calle 28',
      responsable: 'Ramiro Suárez',
      telefono: '3011122334',
      capacidad: 12000,
      ocupado: 11000,
      activa: true,
      icono: '🚢',
      productos: [
        { id: 'p11', nombre: 'Eslingas de Carga Pesada', sku: 'ESL-05', categoria: 'Logística', cantidad: 11000 }
      ]
    },
    {
      id: 11,
      nombre: 'Bodega Cúcuta',
      codigo: 'BOD-011',
      ciudad: 'Cúcuta',
      direccion: 'Zona Franca Local 4',
      responsable: 'Yolanda Bermúdez',
      telefono: '3123344556',
      capacidad: 10000,
      ocupado: 3000,
      activa: true,
      icono: '🏢',
      productos: [
        { id: 'p12', nombre: 'Lámparas LED de Bodega', sku: 'LAM-10', categoria: 'Iluminación', cantidad: 3000 }
      ]
    },
    {
      id: 12,
      nombre: 'Depósito Ibagué',
      codigo: 'BOD-012',
      ciudad: 'Ibagué',
      direccion: 'Cra 5 # 60-19',
      responsable: 'Héctor Rojas',
      telefono: '3167788990',
      capacidad: 6500,
      ocupado: 6200,
      activa: true,
      icono: '🏬',
      productos: [
        { id: 'p13', nombre: 'Baterías Recargables UPS', sku: 'BAT-03', categoria: 'Tecnología', cantidad: 6200 }
      ]
    },
    {
      id: 13,
      nombre: 'Bodega Neiva',
      codigo: 'BOD-013',
      ciudad: 'Neiva',
      direccion: 'Calle 8 # 35-10',
      responsable: 'Clara Inés',
      telefono: '3174455661',
      capacidad: 5500,
      ocupado: 1200,
      activa: false,
      icono: '📦',
      productos: []
    },
    {
      id: 14,
      nombre: 'Centro Logístico Pasto',
      codigo: 'BOD-014',
      ciudad: 'Pasto',
      direccion: 'Salida Panamericana # 2-10',
      responsable: 'Gerardo Benavides',
      telefono: '3195566778',
      capacidad: 7000,
      ocupado: 4000,
      activa: true,
      icono: '🏭',
      productos: [
        { id: 'p14', nombre: 'Estibas Plásticas Reforzadas', sku: 'EST-PL', categoria: 'Almacenamiento', cantidad: 4000 }
      ]
    },
    {
      id: 15,
      nombre: 'Bodega Montería',
      codigo: 'BOD-015',
      ciudad: 'Montería',
      direccion: 'Calle 41 # 9-50',
      responsable: 'Fabián Negrete',
      telefono: '3028899001',
      capacidad: 8000,
      ocupado: 3500,
      activa: true,
      icono: '🏢',
      productos: [
        { id: 'p15', nombre: 'Tubería PVC de 4 Pulgadas', sku: 'TUB-PVC', categoria: 'Construcción', cantidad: 3500 }
      ]
    }
  ]);

  // Método para crear una nueva bodega desde el formulario con salida JSON en consola
  crearBodega(form: NgForm) {
    if (form.valid) {
      const nueva: Bodega = {
        id: Date.now(),
        nombre: this.nuevaBodega.nombre,
        codigo: this.nuevaBodega.codigo,
        ciudad: this.nuevaBodega.ciudad,
        direccion: this.nuevaBodega.direccion,
        responsable: this.nuevaBodega.responsable,
        telefono: this.nuevaBodega.telefono,
        capacidad: Number(this.nuevaBodega.capacidad),
        ocupado: 0,
        activa: true,
        icono: '📦',
        productos: []
      };

      // Muestra en formato JSON limpio la bodega recién creada en la consola
      console.log("=== JSON NUEVA BODEGA CREADA ===");
      console.log(JSON.stringify(nueva, null, 2));

      this.bodegas.update(lista => [nueva, ...lista]);

      this.mostrarModal.set(false);
      form.resetForm();
      this.nuevaBodega = {
        nombre: '',
        codigo: '',
        ciudad: '',
        direccion: '',
        responsable: '',
        telefono: '',
        capacidad: 0
      };
    }
  }

  // Método al hacer clic en una tarjeta con salida JSON en consola
  verDetalleBodega(bodega: Bodega, event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest('.switch-container') || target.closest('input')) {
      return;
    }
    
    // Muestra en formato JSON limpio la bodega seleccionada y sus productos en la consola
    console.log("=== JSON BODEGA SELECCIONADA Y SUS PRODUCTOS ===");
    console.log(JSON.stringify(bodega, null, 2));

    this.bodegaSeleccionada.set(bodega);
    this.mostrarModalDetalle.set(true);
  }

  cerrarModalDetalle() {
    this.mostrarModalDetalle.set(false);
    this.bodegaSeleccionada.set(null);
  }

  getPorcentaje(ocupado: number, capacidad: number): number {
    if (!capacidad || capacidad === 0) return 0;
    return Math.round((ocupado / capacidad) * 100);
  }

  toggleEstado(id: number) {
    this.bodegas.update(lista => 
      lista.map(b => b.id === id ? { ...b, activa: !b.activa } : b)
    );
  }
}