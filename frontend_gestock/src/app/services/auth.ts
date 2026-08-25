import { Injectable } from '@angular/core';

export interface Usuario {
  nombre?: string;
  email: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private keyUsuarios = 'gestock_usuarios';
  private keySesion = 'gestock_sesion_activa';

  // Obtiene los usuarios guardados en localStorage
  private obtenerUsuarios(): Usuario[] {
    const data = localStorage.getItem(this.keyUsuarios);
    
    if (!data) {
      // Credenciales por defecto si no hay usuarios guardados
      const usuarioPrueba: Usuario[] = [
        {
          nombre: 'Usuario Demo',
          email: 'admin@gestock.com',
          password: '123'
        }
      ];
      localStorage.setItem(this.keyUsuarios, JSON.stringify(usuarioPrueba));
      return usuarioPrueba;
    }

    return JSON.parse(data);
  }

  // Registra un nuevo usuario
  registrar(usuario: Usuario): boolean {
    const usuarios = this.obtenerUsuarios();
    const existe = usuarios.find(u => u.email === usuario.email);

    if (existe) {
      console.warn('⚠️ [AUTH] El correo ya está registrado:', usuario.email);
      return false;
    }

    usuarios.push(usuario);
    localStorage.setItem(this.keyUsuarios, JSON.stringify(usuarios));
    console.log('✅ [AUTH] Usuario registrado exitosamente:', usuario.email);
    return true;
  }

  // Verifica credenciales para iniciar sesión
  login(email: string, password?: string): boolean {
    const usuarios = this.obtenerUsuarios();
    
    // Si viene de Google (sin contraseña), busca solo por email
    const usuarioValido = password !== undefined
      ? usuarios.find(u => u.email === email && u.password === password)
      : usuarios.find(u => u.email === email);

    if (usuarioValido) {
      localStorage.setItem(this.keySesion, JSON.stringify({ email: usuarioValido.email }));
      console.log('🚀 [AUTH] Inicio de sesión exitoso:', email);
      return true;
    }

    console.error('❌ [AUTH] Credenciales incorrectas para:', email);
    return false;
  }

  // Comprueba si hay una sesión activa
  estaAutenticado(): boolean {
    return localStorage.getItem(this.keySesion) !== null;
  }

  // Cierra la sesión activa borrando la clave de localStorage
  logout(): void {
    localStorage.removeItem(this.keySesion);
    console.log('🚪 [AUTH] Sesión cerrada correctamente.');
  }
}