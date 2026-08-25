import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth';

// SDK global de Google (cargado en index.html)
declare const google: any;

const GOOGLE_CLIENT_ID = '863694515165-6dovpoe54dq2j63kkln7po1vuvciiqmh.apps.googleusercontent.com';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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

  isLoading = false;
  activeField: string | null = null;

  mouseX = 0;
  mouseY = 0;

  private tokenClient: any;

  ngOnInit(): void {
    this.inicializarGoogle();
  }

  // Espera a que el script de Google esté listo
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

  // Trae los datos del usuario usando el token que entregó Google
  private obtenerPerfilGoogle(accessToken: string): void {
    this.isLoading = true;
    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(perfil => {
        // Registrar o iniciar sesión en AuthService
        this.authService.registrar({
          nombre: perfil.name || 'Usuario Google',
          email: perfil.email
        });
        
        this.authService.login(perfil.email);
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      })
      .catch(() => {
        this.isLoading = false;
        alert('Error al autenticar con Google');
      });
  }

  // Rastrea las coordenadas del mouse sobre la tarjeta
  onMouseMove(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    this.mouseX = event.clientX - rect.left;
    this.mouseY = event.clientY - rect.top;
  }

  setFocus(field: string): void {
    this.activeField = field;
  }

  clearFocus(): void {
    this.activeField = null;
  }

  onLogin(): void {
    if (!this.credentials.email || !this.credentials.password) {
      alert('Por favor completa todos los campos.');
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      const exito = this.authService.login(this.credentials.email, this.credentials.password);
      this.isLoading = false;

      if (exito) {
        this.router.navigate(['/dashboard']);
      } else {
        alert('Credenciales incorrectas. Verifica tu correo y contraseña o regístrate primero.');
      }
    }, 1000);
  }

  // Abre el selector de cuentas de Google
  loginWithGoogle(): void {
    if (!this.tokenClient) {
      this.inicializarGoogle();
      return;
    }
    this.tokenClient.requestAccessToken({ prompt: 'select_account' });
  }
}