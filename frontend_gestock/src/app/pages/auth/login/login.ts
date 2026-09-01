import { Component, OnInit, inject } from '@angular/core';
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
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loginForm!: FormGroup;
  mostrarModalRol: boolean = false;
  errorMessage: string = '';
  
  private readonly ADMIN_SUPERIOR_EMAIL = 'admin@gestock.com';

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
    });
  }
}