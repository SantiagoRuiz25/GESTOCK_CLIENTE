import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

export type RolUsuario = 
  | 'Administrador' 
  | 'Supervisor' 
  | 'Técnico de Mantenimiento' 
  | 'Técnico Mantenimiento' 
  | 'Auditor' 
  | 'Operario' 
  | 'Operador';

export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  correo?: string;
  password?: string;
  rol: RolUsuario | string;
  empresaId?: number;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private keyUsuarios = 'gestock_usuarios';
  private keySesion = 'gestock_usuario_sesion';

  constructor() {
    this.inicializarUsuarios();
  }

  private inicializarUsuarios(): Usuario[] {
    const data = localStorage.getItem(this.keyUsuarios);
    if (data) {
      return JSON.parse(data);
    }

    const usuariosIniciales: Usuario[] = [
      { nombre: 'Admin System', email: 'admin@gestock.com', correo: 'admin@gestock.com', password: '123', rol: 'Administrador' },
      { nombre: 'Supervisor Logística', email: 'supervisor@gestock.com', correo: 'supervisor@gestock.com', password: '123', rol: 'Supervisor' },
      { nombre: 'Técnico Mantenimiento', email: 'tecnico@gestock.com', correo: 'tecnico@gestock.com', password: '123', rol: 'Técnico de Mantenimiento' },
      { nombre: 'Auditor General', email: 'auditor@gestock.com', correo: 'auditor@gestock.com', password: '123', rol: 'Auditor' },
      { nombre: 'Operario Almacén', email: 'operario@gestock.com', correo: 'operario@gestock.com', password: '123', rol: 'Operario' }
    ];

    localStorage.setItem(this.keyUsuarios, JSON.stringify(usuariosIniciales));
    return usuariosIniciales;
  }

  obtenerUsuarios(): Usuario[] {
    const data = localStorage.getItem(this.keyUsuarios);
    return data ? JSON.parse(data) : this.inicializarUsuarios();
  }

  registrar(nuevoUsuario: Usuario): boolean {
    const usuarios = this.obtenerUsuarios();
    const existe = usuarios.some(u => (u.email || u.correo) === (nuevoUsuario.email || nuevoUsuario.correo));
    if (existe) {
      return false;
    }
    usuarios.push(nuevoUsuario);
    localStorage.setItem(this.keyUsuarios, JSON.stringify(usuarios));
    return true;
  }

  login(emailOrCorreo: string, password?: string): boolean {
    const usuarios = this.obtenerUsuarios();
    const usuarioValido = usuarios.find(u => 
      (u.email === emailOrCorreo || u.correo === emailOrCorreo) && 
      (!password || u.password === password)
    );

    if (usuarioValido) {
      const sesionData: Usuario = {
        ...usuarioValido,
        email: usuarioValido.email || usuarioValido.correo || '',
        correo: usuarioValido.correo || usuarioValido.email || ''
      };
      localStorage.setItem(this.keySesion, JSON.stringify(sesionData));
      return true;
    }

    return false;
  }

  obtenerUsuarioActual(): Usuario | null {
    const data = localStorage.getItem(this.keySesion);
    return data ? JSON.parse(data) : null;
  }

  estaAutenticado(): boolean {
    return this.obtenerUsuarioActual() !== null;
  }

  logout(): void {
    localStorage.removeItem(this.keySesion);
    this.router.navigate(['/auth/login']);
  }

  obtenerRutaInicialPorRol(): string {
    const usuario = this.obtenerUsuarioActual();
    const rol = usuario?.rol || '';

    if (rol === 'Administrador' || rol === 'Supervisor' || rol === 'Auditor') {
      return '/app/panel';
    }
    if (rol === 'Operario' || rol === 'Operador') {
      return '/app/recepcion/recepcion-mercancias';
    }
    if (rol === 'Técnico de Mantenimiento' || rol === 'Técnico Mantenimiento') {
      return '/app/programacion';
    }

    return '/app/gestion/inventario';
  }
}