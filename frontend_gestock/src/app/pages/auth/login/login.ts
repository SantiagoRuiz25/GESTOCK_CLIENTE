import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  mostrarModalRol: boolean = false;
  
  private readonly ADMIN_SUPERIOR_EMAIL = 'admin@gestock.com';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      recordar: [false]
    });
  }

  procesarLogin() {
    // Si el formulario es inválido, no hace nada (prevención extra)
    if (this.loginForm.invalid) {
      console.warn('El formulario tiene errores de validación.');
      return;
    }

    const emailIngresado = this.loginForm.value.email.trim().toLowerCase();
    console.log('Intentando iniciar sesión con:', emailIngresado);

    if (emailIngresado === this.ADMIN_SUPERIOR_EMAIL) {
      // Guardamos la sesión
      localStorage.setItem('user_role', 'super_admin');
      localStorage.setItem('user_email', emailIngresado);
      
      // Redirección obligatoria solicitada
      this.enrutarARegistroEmpresa();
    } else {
      // Abre el modal si no es el admin principal
      this.mostrarModalRol = true;
    }
  }

  confirmarAcceso(tipoRol: 'admin' | 'usuario') {
    const email = this.loginForm.value.email.trim().toLowerCase();
    
    localStorage.setItem('user_email', email);
    localStorage.setItem('user_role', tipoRol);

    this.mostrarModalRol = false;

    // Redirección obligatoria solicitada sin importar el rol
    this.enrutarARegistroEmpresa();
  }

  cancelarSeleccionRol() {
    this.mostrarModalRol = false;
  }

  // Función auxiliar para manejar posibles errores de ruteo
  private enrutarARegistroEmpresa() {
    console.log('Redirigiendo a registrar-empresa...');
    
    // Intenta la ruta con prefijo /app/ primero
    this.router.navigate(['/app/registrar-empresa']).catch(err => {
      console.error('No se encontró /app/registrar-empresa, intentando ruta raíz...', err);
      // Fallback a la ruta raíz si tus rutas no están anidadas en /app
      this.router.navigate(['/registrar-empresa']);
    });
  }
}