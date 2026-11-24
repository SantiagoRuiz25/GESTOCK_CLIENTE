/**
 * Modelos del dominio de inventario.
 *
 * Nota de diseño: `bodegaId` es un número y `bodegaNombre` es solo para
 * mostrar. Antes el producto guardaba `bodega` como texto libre, lo que
 * rompía la integridad referencial: renombrar una bodega dejaba productos
 * apuntando a un nombre que ya no existía. Con el ID, la relación la
 * valida el servidor.
 */

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  bodegaId: number;
  /** Desnormalizado por el backend para evitar N+1 en el listado. */
  bodegaNombre: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

/** Payload de creación. El ID y los timestamps los asigna el servidor. */
export interface ProductoCreate {
  codigo: string;
  nombre: string;
  categoria: string;
  bodegaId: number;
  precio: number;
  stock: number;
  stockMinimo: number;
}

/** Payload de actualización parcial. Solo se envían los campos que cambian. */
export interface ProductoUpdate {
  nombre?: string;
  categoria?: string;
  bodegaId?: number;
  precio?: number;
  stock?: number;
  stockMinimo?: number;
  activo?: boolean;
}

export interface Bodega {
  id: number;
  nombre: string;
  codigo: string;
  activa: boolean;
}

export type NivelStock = 'agotado' | 'bajo' | 'suficiente';

export function nivelDeStock(producto: Producto): NivelStock {
  if (producto.stock <= 0) {
    return 'agotado';
  }
  if (producto.stock <= producto.stockMinimo) {
    return 'bajo';
  }
  return 'suficiente';
}
