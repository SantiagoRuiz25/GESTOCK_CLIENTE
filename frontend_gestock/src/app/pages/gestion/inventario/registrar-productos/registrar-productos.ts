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

  bodegasActivas = signal([
    { id: 1, nombre: 'Bodega Central', estado: 'Activa' },
    { id: 2, nombre: 'Bodega Norte', estado: 'Activa' },
    { id: 3, nombre: 'Bodega de Tránsito', estado: 'Activa' }
  ]);

  producto = signal({
    codigo: '',
    nombre: '',
    categoria: '',
    bodega: '',
    precio: null,
    stock: null
  });

  mensajeExito: string | null = null;

  getBodegasActivasDisponibles(): any[] {
    return this.bodegasActivas();
  }

  registrarProducto(form: NgForm) {
    if (form.valid) {
      console.log('Producto registrado:', this.producto());
      this.mostrarNotificacion('¡Producto registrado con éxito en el inventario!');
      
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