import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { finalize } from 'rxjs';

import { InventarioService } from '../../../../core/services/inventario.service';
import { ToastService } from '../../../../core/services/toast.service';

function productoVacio() {
  return {
    codigo: '',
    nombre: '',
    categoria: '',
    bodega: null as number | null,
    precio: null as number | null,
    stock: null as number | null,
  };
}

@Component({
  selector: 'app-registrar-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-productos.html',
  styleUrls: ['./registrar-productos.css'],
})
export class RegistrarProductosComponent implements OnInit {
  private readonly inventario = inject(InventarioService);
  private readonly toast = inject(ToastService);

  readonly producto = signal(productoVacio());
  readonly categorias = this.inventario.categorias;
  readonly bodegasDisponibles = computed(() => this.inventario.bodegas().filter((bodega) => bodega.activa));
  readonly cargandoCategorias = signal(true);
  readonly errorCategorias = signal(false);
  readonly cargandoBodegas = signal(true);
  readonly errorBodegas = signal(false);
  readonly guardando = signal(false);

  ngOnInit(): void {
    this.inventario.listarCategorias()
      .pipe(finalize(() => this.cargandoCategorias.set(false)))
      .subscribe({ error: () => this.errorCategorias.set(true) });

    this.inventario.listarBodegas()
      .pipe(finalize(() => this.cargandoBodegas.set(false)))
      .subscribe({ error: () => this.errorBodegas.set(true) });
  }

  registrarProducto(form: NgForm): void {
    if (form.invalid || this.guardando()) return;

    const { codigo, nombre, categoria, bodega, precio, stock } = this.producto();
    if (!codigo.trim() || !nombre.trim() || !this.categorias().includes(categoria) ||
        bodega === null || !this.bodegasDisponibles().some((opcion) => opcion.id === bodega) ||
        precio === null || !Number.isFinite(precio) || precio < 0 ||
        stock === null || !Number.isInteger(stock) || stock < 0) {
      this.toast.aviso('Revisa los campos y selecciona una categoría y una bodega activas.');
      return;
    }

    this.guardando.set(true);
    this.inventario.crearProducto({
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      categoria,
      bodegaId: bodega,
      precio,
      stock,
      stockMinimo: 0,
    }).pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => {
        const vacio = productoVacio();
        form.resetForm(vacio);
        this.producto.set(vacio);
        this.toast.exito('Producto registrado con éxito.');
      },
      error: (error: unknown) => this.toast.errorDesdeApi(error, 'No se pudo guardar el producto.'),
    });
  }
}