import { Injectable } from '@angular/core';

// 1. Define los roles permitidos
export type RolUsuario = 'Administrador' | 'Supervisor' | 'Operario' | 'Auditor';

// 2. Agrega la propiedad rol a la interfaz
export interface Usuario {
  nombre?: string;
  email: string;
  password?: string;
  rol?: RolUsuario; // 👈 Aquí agregas el atributo opcional
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private keyUsuarios = 'gestock_usuarios';
  private keySesion = 'gestock_sesion_activa';

  private obtenerUsuarios(): Usuario[] {
    const data = localStorage.getItem(this.keyUsuarios);
    
    if (!data) {
      const usuariosIniciales: Usuario[] = [
        { nombre: 'Admin System', email: 'admin@gestock.com', password: '123', rol: 'Administrador' },
        { nombre: 'Supervisor Logística', email: 'supervisor@gestock.com', password: '123', rol: 'Supervisor' },
        { nombre: 'Operario Bodega', email: 'operario@gestock.com', password: '123', rol: 'Operario' },
        { nombre: 'Auditor General', email: 'auditor@gestock.com', password: '123', rol: 'Auditor' }
      ];
      localStorage.setItem(this.keyUsuarios, JSON.stringify(usuariosIniciales));
      return usuariosIniciales;
    }

    return JSON.parse(data);
  }

  registrar(usuario: Usuario): boolean {
    const usuarios = this.obtenerUsuarios();
    const existe = usuarios.find(u => u.email === usuario.email);

    if (existe) {
      return false;
    }

    // Asigna 'Operario' por defecto si no especifica rol
    if (!usuario.rol) {
      usuario.rol = 'Operario';
    }

    usuarios.push(usuario);
    localStorage.setItem(this.keyUsuarios, JSON.stringify(usuarios));
    return true;
  }

  login(email: string, password?: string): boolean {
    const usuarios = this.obtenerUsuarios();
    
    // Soporta autenticación con contraseña o mediante Google (solo email)
    const usuarioValido = password !== undefined
      ? usuarios.find(u => u.email === email && u.password === password)
      : usuarios.find(u => u.email === email);

    if (usuarioValido) {
      localStorage.setItem(this.keySesion, JSON.stringify(usuarioValido));
      return true;
    }

    return false;
  }

  obtenerUsuarioActual(): Usuario | null {
    const sesion = localStorage.getItem(this.keySesion);
    return sesion ? JSON.parse(sesion) : null;
  }

  obtenerRol(): RolUsuario | null {
    const usuario = this.obtenerUsuarioActual();
    return usuario?.rol || null;
  }

  estaAutenticado(): boolean {
    return localStorage.getItem(this.keySesion) !== null;
  }

  logout(): void {
    localStorage.removeItem(this.keySesion);
  }
}