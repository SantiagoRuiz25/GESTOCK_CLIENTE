import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { EmpresasService, etiquetaMoneda } from '../../../services/empresas.service';
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EstadisticasService } from '../../../services/estadisticas.service';

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
  private readonly apiEmpresas = inject(EmpresasService);

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
    if (this.isLoading()) return;
    this.errorMessage.set('');

    if (this.nuevaEmpresaForm.invalid) {
      this.nuevaEmpresaForm.markAllAsTouched();
      this.errorMessage.set('Completa correctamente los campos obligatorios.');
      return;
    }

    this.isLoading.set(true);
    this.apiEmpresas.crear(this.nuevaEmpresaForm.getRawValue())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (empresa) => {
          const seleccion = {
            id: String(empresa.id),
            nombre: empresa.nombre,
            email: empresa.correo,
            moneda: etiquetaMoneda[empresa.moneda],
            formatoFecha: empresa.formato_fecha,
            estado: empresa.activo ? 'Activa' : 'Inactiva',
          };

          localStorage.setItem('empresaIdSeleccionada', seleccion.id);
          localStorage.setItem('empresa_activa', JSON.stringify(seleccion));
          localStorage.setItem('gestock_empresa_activa', JSON.stringify(seleccion));

          this.estadisticasService.cambiarEmpresaActiva({
            ...seleccion,
            activa: empresa.activo,
            bodegasActivas: 0,
            totalPrecios: 0,
            valorInventario: 0,
            alertasStock: 0,
          });

          void this.router.navigate(['/app/panel']);
        },
        error: (error: unknown) => {
          const mensaje = error instanceof HttpErrorResponse ? error.error?.Message : undefined;
          this.errorMessage.set(
            typeof mensaje === 'string' ? mensaje : 'No se pudo guardar la empresa. Inténtalo de nuevo.',
          );
        },
      });
  }
}