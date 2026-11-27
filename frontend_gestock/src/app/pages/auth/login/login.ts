import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
<<<<<<< HEAD
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { ApiError } from '../../../core/models/api.model';

declare const google: any;

const GOOGLE_CLIENT_ID = '863694515165-6dovpoe54dq2j63kkln7po1vuvciiqmh.apps.googleusercontent.com';
=======
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
>>>>>>> origin/develop

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

<<<<<<< HEAD
  credentials = {
    email: '',
    password: '',
    rememberMe: false,
  };

  
  activeField: string | null = null;
  isLoading: boolean = false;
=======
  loginForm!: FormGroup;
  mostrarModalRol: boolean = false;
>>>>>>> origin/develop
  errorMessage: string = '';
  
  private readonly ADMIN_SUPERIOR_EMAIL = 'admin@gestock.com';

<<<<<<< HEAD
  private tokenClient: any;

  /**
   * Intentos de carga del SDK de Google.
   *
   * Antes era un `setTimeout` recursivo sin límite: si el script de Google no
   * cargaba, el bucle seguía para siempre quemando CPU en segundo plano. Tres
   * intentos bastan; si falla, el login con Google simplemente no aparece.
   */
  private static readonly MAX_INTENTOS_GOOGLE = 3;
  private intentosGoogle = 0;

  ngOnInit(): void {
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

  /**
   * Canjea el token de Google por una sesión de GESTOCK.
   *
   * El `rol: 'Operario'` fijo que tenía antes era un agujero de autorización:
   * cualquiera que se autenticara con Google entraba con permisos de operario
   * sin que el servidor opinara. Ahora el perfil se envía al backend, que es
   * quien decide el rol; en modo demo se conserva el operario como antes.
   */
  private obtenerPerfilGoogle(accessToken: string): void {
    this.isLoading = true;

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
          // Contraseña derivada del id de Google. No es una credencial real
          // que el usuario pueda teclear ni adivinar, y evita el alta con
          // 'demo' que colisionaba entre dos cuentas de Google distintas.
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
            // Ya existía: solo hay que iniciar sesión.
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

  // Procesa el inicio de sesión manual
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
=======
  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      recordar: [false]
    });
  }

  procesarLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      console.warn('El formulario tiene errores de validación.');
      return;
    }

    const emailIngresado = this.loginForm.value.email.trim().toLowerCase();
    console.log('Intentando iniciar sesión con:', emailIngresado);

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
>>>>>>> origin/develop
    }
  }

  confirmarAcceso(tipoRol: 'admin' | 'usuario') {
    const email = this.loginForm.value.email.trim().toLowerCase();
    const nombreRol = tipoRol === 'admin' ? 'Administrador' : 'Auditor General';
    
    localStorage.setItem('user_email', email);
    localStorage.setItem('user_role', tipoRol);
    localStorage.setItem('gestock_usuario_sesion', JSON.stringify({ 
      email: email, 
      rol: nombreRol, 
      nombre: 'Usuario' 
    }));

<<<<<<< HEAD
    // El `setTimeout` de 400 ms que simulaba latencia se elimina: la espera
    // ahora es la red real, y mantenerla hacía creer al usuario que el sistema
    // era más lento de lo que es.
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
=======
    this.mostrarModalRol = false;
    this.enrutarARegistroEmpresa();
  }

  cancelarSeleccionRol() {
    this.mostrarModalRol = false;
  }

  private enrutarARegistroEmpresa() {
    console.log('Redirigiendo a registrar-empresa...');
    
    this.router.navigate(['/app/registrar-empresa']).catch(err => {
      console.error('No se encontró /app/registrar-empresa, intentando ruta raíz...', err);
      this.router.navigate(['/registrar-empresa']);
>>>>>>> origin/develop
    });
  }
}