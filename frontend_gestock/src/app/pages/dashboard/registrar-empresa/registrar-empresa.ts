import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EstadisticasService, Empresa } from '../../../services/estadisticas.service';

@Component({
  selector: 'app-registrar-empresa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registrar-empresa.html',
  styleUrls: ['./registrar-empresa.css']
})
export class RegistrarEmpresaComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private estadisticasService = inject(EstadisticasService);

  // Uso de Signals para el estado del componente (Angular moderno)
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  // Definición del formulario con validadores reactivos
  empresaForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    moneda: ['COP - Peso Colombiano', Validators.required],
    formatoFecha: ['DD/MM/YYYY', Validators.required]
  });

  guardarEmpresa(): void {
    this.errorMessage.set('');

    if (this.empresaForm.invalid) {
      this.empresaForm.markAllAsTouched();
      this.errorMessage.set('⚠️ Por favor, complete correctamente los campos obligatorios.');
      return;
    }

    this.isLoading.set(false);

    // Simulamos un breve respiro del hilo principal (macrotarea) para evitar bloqueos de renderizado
    setTimeout(() => {
      try {
        const formValues = this.empresaForm.value;
        
        const nuevaEmpresa: Empresa = {
          id: Date.now().toString(),
          nombre: formValues.nombre.trim(),
          email: formValues.email.trim(),
          moneda: formValues.moneda,
          formatoFecha: formValues.formatoFecha,
          bodegasActivas: 1,
          totalPrecios: 0,
          valorInventario: 0,
          alertasStock: 0
        };

        // Notificar al servicio
        this.estadisticasService.cambiarEmpresaActiva(nuevaEmpresa);

        console.log('%c[GESTOCK] Empresa creada con éxito:', 'color: #10b981; font-weight: bold;', nuevaEmpresa);
        
        this.router.navigate(['/app/panel']);
      } catch (error) {
        console.error('[GESTOCK Error]:', error);
        this.errorMessage.set('❌ Ocurrió un error al guardar la empresa.');
        this.isLoading.set(false);
      }
    }, 300);
    
  }
}