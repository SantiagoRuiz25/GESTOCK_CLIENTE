import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { ApiError } from '../../../core/models/api.model';

declare const google: any;

const GOOGLE_CLIENT_ID = '863694515165-6dovpoe54dq2j63kkln7po1vuvciiqmh.apps.googleusercontent.com';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  loginForm!: FormGroup;
  mostrarModalRol: boolean = false;

  credentials = {
    email: '',
    password: '',
    rememberMe: false,
  };

  activeField: string | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  mouseX: number = 0;
  mouseY: number = 0;

  private readonly ADMIN_SUPERIOR_EMAIL = 'admin@gestock.com';
  private tokenClient: any;

  private static readonly MAX_INTENTOS_GOOGLE = 3;
  private intentosGoogle = 0;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      recordar: [false]
    });

    this.inicializarGoogle();
  }

  private inicializarGoogle(): void {
    if (typeof google !== 'undefined' && google.accounts) {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: (respuesta: any) => {
          if (respuesta.access_token) {
            this.obtenerPerfilGoogle(respuesta.access_token);
          }
        },
      });
      return;
    }

    if (this.intentosGoogle < LoginComponent.MAX_INTENTOS_GOOGLE) {
      this.intentosGoogle++;
      setTimeout(() => this.inicializarGoogle(), 200);
    }
  }

  private obtenerPerfilGoogle(accessToken: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`userinfo respondió ${res.status}`);
        }
        return res.json();
      })
      .then((perfil) => {
        const email: string = perfil.email ?? '';
        if (!email) {
          throw new Error('La cuenta de Google no expone correo.');
        }

        this.authService.registrarUsuario({
          nombre: perfil.name || 'Usuario Google',
          email,
          password: `g-${perfil.sub}`,
          rol: 'Operario',
        }).subscribe({
          next: () => {
            this.authService.iniciarSesion(email, `g-${perfil.sub}`).subscribe({
              next: () => {
                this.isLoading = false;
                void this.router.navigate([this.authService.obtenerRutaInicialPorRol()]);
              },
              error: () => {
                this.isLoading = false;
                this.errorMessage = '⚠️ No se pudo iniciar sesión con esa cuenta.';
              },
            });
          },
          error: () => {
            this.authService.iniciarSesion(email, 'demo').subscribe({
              next: () => {
                this.isLoading = false;
                void this.router.navigate([this.authService.obtenerRutaInicialPorRol()]);
              },
              error: () => {
                this.isLoading = false;
                this.errorMessage = '⚠️ No se pudo iniciar sesión con esa cuenta.';
              },
            });
          },
        });
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

  onLogin(): void {
    this.errorMessage = '';

    const email = this.credentials.email?.trim() ?? '';
    const password = this.credentials.password?.trim() ?? '';

    if (!email || !password) {
      this.errorMessage = '⚠️ Todos los campos son obligatorios.';
      return;
    }

    if (!this.validarEmail(email)) {
      this.errorMessage = '⚠️ Error: Debe ingresar un correo electrónico válido.';
      return;
    }

    this.isLoading = true;
    this.authService.iniciarSesion(email, password).subscribe({
      next: () => {
        this.isLoading = false;
        void this.router.navigate([this.authService.obtenerRutaInicialPorRol()]);
      },
      error: (err: unknown) => {
        this.isLoading = false;
        this.errorMessage =
          err instanceof ApiError
            ? `⚠️ ${err.mensaje}`
            : '⚠️ Credenciales incorrectas. Verifica tu correo y contraseña.';
      },
    });
  }

  procesarLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      console.warn('El formulario tiene errores de validación.');
      return;
    }

    const emailIngresado = (this.loginForm.value.email ?? '').trim().toLowerCase();
    const passwordIngresado = (this.loginForm.value.password ?? '').trim();
    console.log('Intentando iniciar sesión con:', emailIngresado);

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.iniciarSesion(emailIngresado, passwordIngresado).subscribe({
      next: () => {
        this.isLoading = false;
        if (emailIngresado === this.ADMIN_SUPERIOR_EMAIL) {
          localStorage.setItem('user_role', 'super_admin');
          localStorage.setItem('user_email', emailIngresado);
          localStorage.setItem('gestock_usuario_sesion', JSON.stringify({
            email: emailIngresado,
            rol: 'Administrador',
            nombre: 'Administrador Principal'
          }));
          this.enrutarARegistroEmpresa();
        } else {
          this.mostrarModalRol = true;
        }
      },
      error: (err: unknown) => {
        this.isLoading = false;
        this.errorMessage =
          err instanceof ApiError
            ? `⚠️ ${err.mensaje}`
            : '⚠️ No se pudo iniciar sesión. Verifica tus credenciales.';
      }
    });
  }

  confirmarAcceso(tipoRol: 'admin' | 'usuario'): void {
    const email = (this.loginForm?.value?.email ?? '').trim().toLowerCase();
    const nombreRol = tipoRol === 'admin' ? 'Administrador' : 'Auditor General';

    localStorage.setItem('user_email', email);
    localStorage.setItem('user_role', tipoRol);
    localStorage.setItem('gestock_usuario_sesion', JSON.stringify({
      email,
      rol: nombreRol,
      nombre: 'Usuario'
    }));

    this.mostrarModalRol = false;
    this.enrutarARegistroEmpresa();
  }

  cancelarSeleccionRol(): void {
    this.mostrarModalRol = false;
  }

  private enrutarARegistroEmpresa(): void {
    console.log('Redirigiendo a registrar-empresa...');

    this.router.navigate(['/app/registrar-empresa']).catch(err => {
      console.error('No se encontró /app/registrar-empresa, intentando ruta raíz...', err);
      void this.router.navigate(['/registrar-empresa']);
    });
  }
}