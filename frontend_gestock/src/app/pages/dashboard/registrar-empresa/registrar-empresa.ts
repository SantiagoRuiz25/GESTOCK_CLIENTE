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

  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  
  // Propiedad añadida para solucionar el error de plantilla al reutilizar el modal
  mostrarModalCrear: boolean = true;

  nuevaEmpresaForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    moneda: ['COP - Peso Colombiano', Validators.required],
    formatoFecha: ['DD/MM/YYYY', Validators.required]
  });

  cerrarModalCrear() {
    this.mostrarModalCrear = false;
    this.router.navigate(['/app/panel']).catch(() => {
      window.location.hash = '/app/panel';
    });
  }

  crearNuevaEmpresa(): void {
    this.errorMessage.set('');

    if (this.nuevaEmpresaForm.invalid) {
      this.nuevaEmpresaForm.markAllAsTouched();
      this.errorMessage.set('⚠️ Por favor, complete correctamente los campos obligatorios.');
      return;
    }

    this.isLoading.set(true);

    setTimeout(() => {
      try {
        const formValues = this.nuevaEmpresaForm.value;
        const nuevaId = `EMP-${Date.now().toString().slice(-4)}`;
        
        const nuevaEmpresa: Empresa = {
          id: nuevaId,
          nombre: formValues.nombre.trim(),
          email: formValues.email.trim(),
          moneda: formValues.moneda,
          formatoFecha: formValues.formatoFecha,
          bodegasActivas: 1,
          totalPrecios: 0,
          valorInventario: 0,
          alertasStock: 0
        };

        const localData = localStorage.getItem('gestock_empresas');
        const empresas = localData ? JSON.parse(localData) : [];
        
        const empresaItem = {
          id: nuevaId,
          nombre: nuevaEmpresa.nombre,
          email: nuevaEmpresa.email,
          moneda: nuevaEmpresa.moneda,
          formatoFecha: nuevaEmpresa.formatoFecha,
          estado: 'Activa'
        };
        
        empresas.unshift(empresaItem);

        localStorage.setItem('gestock_empresas', JSON.stringify(empresas));
        localStorage.setItem('empresa_activa', JSON.stringify(empresaItem));
        localStorage.setItem('gestock_empresa_activa', JSON.stringify(empresaItem));
        localStorage.setItem('empresaIdSeleccionada', nuevaId);

        this.estadisticasService.cambiarEmpresaActiva(nuevaEmpresa);

        console.log('%c[GESTOCK] Empresa creada con éxito:', 'color: #10b981; font-weight: bold;', nuevaEmpresa);
        
        this.isLoading.set(false);
        this.router.navigate(['/app/panel']).catch(() => {
          window.location.hash = '/app/panel';
        });
      } catch (error) {
        console.error('[GESTOCK Error]:', error);
        this.errorMessage.set('❌ Ocurrió un error al guardar la empresa.');
        this.isLoading.set(false);
      }
    }, 300);
  }
}