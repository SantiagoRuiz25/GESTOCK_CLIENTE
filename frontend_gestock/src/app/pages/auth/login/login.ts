import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';

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
    email: 'maicolnore10@gmail.com',
    password: '12345678',
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
        
        // Redirección dinámica según el rol del usuario
        const rutaDestino = this.authService.obtenerRutaInicialPorRol();
        this.router.navigate([rutaDestino]);
      })
      .catch(() => {
        this.isLoading = false;
        this.errorMessage = '⚠️ Error al autenticar con Google.';
      });
  }

  loginWithGoogle(): void {
    if (!this.tokenClient) {
      this.inicializarGoogle();
      return;
    }
    this.tokenClient.requestAccessToken({ prompt: 'select_account' });
  }

  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

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

  // Procesa el inicio de sesión manual
  onLogin(): void {
    this.errorMessage = '';

    if (!this.credentials.email?.trim() || !this.credentials.password?.trim()) {
      this.errorMessage = '⚠️ Todos los campos son obligatorios.';
      return;
    }

    if (!this.validarEmail(this.credentials.email)) {
      this.errorMessage = '⚠️ Error: Debe ingresar un correo electrónico válido.';
      return;
    }

    this.isLoading = true;

    const emailLimpio = this.credentials.email.trim();
    const passwordLimpia = this.credentials.password.trim();

    setTimeout(() => {
      const exito = this.authService.login(emailLimpio, passwordLimpia);
      this.isLoading = false;

      if (exito) {
        // Redirección dinámica según el rol del usuario hacia registrar empresa u otra ruta configurada
        const rutaDestino = this.authService.obtenerRutaInicialPorRol();
        this.router.navigate([rutaDestino]);
      } else {
        this.errorMessage = '⚠️ Credenciales incorrectas. Verifica tu correo y contraseña o regístrate primero.';
      }
    }, 400);
  }
}