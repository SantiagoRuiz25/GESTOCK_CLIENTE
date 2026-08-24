import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-registrar-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-productos.html',
  styleUrls: ['./registrar-productos.css']
})
export class RegistrarProductosComponent {
  categorias = ['Tecnología', 'Accesorios', 'Mobiliario', 'Herramientas', 'Seguridad'];

  // Lista inicial de las 15 bodegas. Todas por defecto en `activa: false` (o respetando lo que ya tengas guardado)
  private bodegasIniciales: any[] = [
    { id: 1, nombre: 'Bodega Principal Yopal', codigo: 'BOD-001', activa: false },
    { id: 2, nombre: 'Centro Logístico Medellín', codigo: 'BOD-002', activa: false },
    { id: 3, nombre: 'Bodega de Tránsito Cali', codigo: 'BOD-003', activa: false },
    { id: 4, nombre: 'Depósito Bogotá Norte', codigo: 'BOD-004', activa: false },
    { id: 5, nombre: 'Bodega Costa Caribe', codigo: 'BOD-005', activa: false },
    { id: 6, nombre: 'Punto Villavicencio', codigo: 'BOD-006', activa: false },
    { id: 7, nombre: 'Bodega Eje Cafetero', codigo: 'BOD-007', activa: false },
    { id: 8, nombre: 'Centro Acopio Bucaramanga', codigo: 'BOD-008', activa: false },
    { id: 9, nombre: 'Bodega Nororiente Cúcuta', codigo: 'BOD-009', activa: false },
    { id: 10, nombre: 'Terminal Logística Cartagena', codigo: 'BOD-010', activa: false },
    { id: 11, nombre: 'Bodega Sur Neiva', codigo: 'BOD-011', activa: false },
    { id: 12, nombre: 'Almacén Manizales Centro', codigo: 'BOD-012', activa: false },
    { id: 13, nombre: 'Bodega Llanos Paz de Ariporo', codigo: 'BOD-013', activa: false },
    { id: 14, nombre: 'Centro Operativo Santa Marta', codigo: 'BOD-014', activa: false },
    { id: 15, nombre: 'Depósito Pasto Andina', codigo: 'BOD-015', activa: false }
  ];

  // Getter que obtiene las bodegas sincronizadas desde el localStorage (para que compartan estado con tu componente de bodegas)
  get bodegasActivas(): any[] {
    const data = localStorage.getItem('inventario_bodegas');
    if (!data) {
      localStorage.setItem('inventario_bodegas', JSON.stringify(this.bodegasIniciales));
      return this.bodegasIniciales;
    }
    return JSON.parse(data);
  }

  producto = signal({
    codigo: '',
    nombre: '',
    categoria: '',
    bodega: '',
    precio: null,
    stock: null
  });

  mensajeExito: string | null = null;

  // Filtra y devuelve ÚNICAMENTE las bodegas que tienen 'activa: true'
  getBodegasActivasDisponibles(): any[] {
    return this.bodegasActivas.filter(b => b.activa);
  }

  registrarProducto(form: NgForm) {
    if (form.valid) {
      const productosGuardados = JSON.parse(localStorage.getItem('inventario_productos') || '[]');
      
      productosGuardados.unshift({ ...this.producto() });
      localStorage.setItem('inventario_productos', JSON.stringify(productosGuardados));

      this.mostrarNotificacion('¡Producto registrado con éxito y visible en lista!');
      
      form.resetForm();
      this.producto.set({
        codigo: '',
        nombre: '',
        categoria: '',
        bodega: '',
        precio: null,
        stock: null
      });
    }
  }

  mostrarNotificacion(mensaje: string) {
    this.mensajeExito = mensaje;
    setTimeout(() => {
      this.mensajeExito = null;
    }, 3500);
  }
}