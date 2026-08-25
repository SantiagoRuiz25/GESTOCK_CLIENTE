import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  credentials = {
    email: '',
    password: '',
    rememberMe: false
  };

  activeField: string | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  mouseX: number = 0;
  mouseY: number = 0;

  constructor(private router: Router) {}

  onMouseMove(event: MouseEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.mouseX = event.clientX - rect.left;
    this.mouseY = event.clientY - rect.top;
  }

  setFocus(field: string) {
    this.activeField = field;
  }

  clearFocus() {
    this.activeField = null;
  }

  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  async onLogin() {
    this.errorMessage = ''; // Limpiar errores previos

    // 1. Validar campos vacíos
    if (!this.credentials.email || !this.credentials.email.trim() || 
        !this.credentials.password || !this.credentials.password.trim()) {
      this.errorMessage = '⚠️ Todos los campos son obligatorios.';
      return;
    }

    // 2. Validar que sea un correo real (ej: si escribe solo un nombre como "maicol" falla)
    if (!this.validarEmail(this.credentials.email)) {
      this.errorMessage = '⚠️ Error: Debe ingresar un correo electrónico válido (ej: usuario@gestock.com).';
      return;
    }

    // 3. Validar longitud mínima de contraseña (8 caracteres)
    if (this.credentials.password.length < 8) {
      this.errorMessage = '⚠️ Error: La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    // Si pasa todas las validaciones con éxito:
    this.isLoading = true;

    const hashedPassword = await this.hashPassword(this.credentials.password);

    const loginPayload = {
      email: this.credentials.email,
      passwordHash: hashedPassword,
      rememberMe: this.credentials.rememberMe,
      timestamp: new Date().toISOString()
    };

    console.log('%c[GESTOCK] Inicio de Sesión Exitoso (Hasheado JSON):', 'color: #38bdf8; font-weight: bold;');
    console.log(JSON.stringify(loginPayload, null, 2));

    setTimeout(() => {
      this.isLoading = false;
      localStorage.setItem('gestock_session', JSON.stringify(loginPayload));
      this.router.navigate(['/app/panel']);
    }, 600);
  }

  loginWithGoogle() {
    console.log('%c[GESTOCK] Iniciando sesión con Google...', 'color: #34d399; font-weight: bold;');
  }
}