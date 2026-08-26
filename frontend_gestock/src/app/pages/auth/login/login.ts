import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';

// SDK global de Google (cargado en index.html)
declare const google: any;

const GOOGLE_CLIENT_ID = '863694515165-6dovpoe54dq2j63kkln7po1vuvciiqmh.apps.googleusercontent.com';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

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

  private tokenClient: any;

  ngOnInit(): void {
    this.inicializarGoogle();
  }

  // Inicializa el cliente SDK de Google
  private inicializarGoogle(): void {
    if (typeof google === 'undefined' || !google.accounts) {
      setTimeout(() => this.inicializarGoogle(), 200);
      return;
    }

    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      callback: (respuesta: any) => {
        if (respuesta.access_token) {
          this.obtenerPerfilGoogle(respuesta.access_token);
        }
      }
    });
  }

  // Obtiene los datos del perfil de Google tras autenticarse
  private obtenerPerfilGoogle(accessToken: string): void {
    this.isLoading = true;
    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(perfil => {
        this.authService.registrar({
          nombre: perfil.name || 'Usuario Google',
          email: perfil.email,
          rol: 'Operario'
        });

        this.authService.login(perfil.email);
        this.isLoading = false;
        
        // Verificación obligatoria de empresa tras login con Google
        this.verificarEmpresaYRedirigir();
      })
      .catch(() => {
        this.isLoading = false;
        this.errorMessage = '⚠️ Error al autenticar con Google.';
      });
  }

  // Abre el selector de cuentas de Google
  loginWithGoogle(): void {
    if (!this.tokenClient) {
      this.inicializarGoogle();
      return;
    }
    this.tokenClient.requestAccessToken({ prompt: 'select_account' });
  }

  // Genera hash SHA-256 de la contraseña para registro/log
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Valida estructura básica de correo
  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Rastrea movimiento del mouse para efectos de estilo/UI
  onMouseMove(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.mouseX = event.clientX - rect.left;
    this.mouseY = event.clientY - rect.top;
  }

  setFocus(field: string): void {
    this.activeField = field;
  }

  clearFocus(): void {
    this.activeField = null;
  }

  /**
   * Valida si el usuario ya tiene una empresa registrada.
   * Si no la tiene, lo redirige obligatoriamente al formulario de nueva empresa.
   * Si ya la tiene, le permite el acceso al sistema de inventarios (/app/panel).
   */
  private verificarEmpresaYRedirigir(): void {
    const empresaRegistrada = localStorage.getItem('gestock_empresa_activa');

    if (!empresaRegistrada) {
      console.log('%c[GESTOCK] Sin empresa registrada. Redirigiendo obligatoriamente al formulario de nueva empresa...', 'color: #f59e0b; font-weight: bold;');
      // Redirección directa al componente del formulario de nueva empresa
      this.router.navigate(['/app/regsistrar-empresa']);
    } else {
      console.log('%c[GESTOCK] Empresa detectada. Acceso concedido al panel de inventarios.', 'color: #10b981; font-weight: bold;');
      this.router.navigate(['/app/registrar-empresa']);
    }
  }

  // Procesa el inicio de sesión manual
  async onLogin(): Promise<void> {
    this.errorMessage = '';

    // 1. Validar campos vacíos
    if (!this.credentials.email?.trim() || !this.credentials.password?.trim()) {
      this.errorMessage = '⚠️ Todos los campos son obligatorios.';
      return;
    }

    // 2. Validar formato de correo
    if (!this.validarEmail(this.credentials.email)) {
      this.errorMessage = '⚠️ Error: Debe ingresar un correo electrónico válido (ej: usuario@gestock.com).';
      return;
    }

    // 3. Validar longitud de contraseña
    if (this.credentials.password.length < 3) {
      this.errorMessage = '⚠️ Error: La contraseña debe tener al menos 3 caracteres.';
      return;
    }

    this.isLoading = true;

    // Log de auditoría local
    const hashedPassword = await this.hashPassword(this.credentials.password);
    console.log('%c[GESTOCK] Intento de login:', 'color: #38bdf8; font-weight: bold;', {
      email: this.credentials.email,
      hash: hashedPassword
    });

    setTimeout(() => {
      const exito = this.authService.login(this.credentials.email, this.credentials.password);
      this.isLoading = false;

      if (exito) {
        // Redirección obligatoria evaluando la existencia de la empresa
        this.verificarEmpresaYRedirigir();
      } else {
        this.errorMessage = '⚠️ Credenciales incorrectas. Verifica tu correo y contraseña o regístrate primero.';
      }
    }, 600);
  }
}