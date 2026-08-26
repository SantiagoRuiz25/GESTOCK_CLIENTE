import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EstadisticasService, Empresa } from '../../../services/estadisticas.service'; // Ajusta la ruta de tu servicio

@Component({
  selector: 'app-registrar-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-empresa.html',
  styleUrls: ['./registrar-empresa.css']
})
export class RegistrarEmpresaComponent {
  private router = inject(Router);
  private estadisticasService = inject(EstadisticasService);

  empresa = {
    nombre: '',
    email: '',
    moneda: 'COP - Peso Colombiano',
    formatoFecha: 'DD/MM/YYYY'
  };

  errorMessage: string = '';
  isLoading: boolean = false;

  guardarEmpresa(): void {
    this.errorMessage = '';

    // Validar campos obligatorios
    if (!this.empresa.nombre.trim() || !this.empresa.email.trim()) {
      this.errorMessage = '⚠️ Por favor, complete todos los campos obligatorios.';
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      // Construir el objeto de empresa completo con métricas iniciales
      const nuevaEmpresa: Empresa = {
        id: Date.now().toString(),
        nombre: this.empresa.nombre.trim(),
        email: this.empresa.email.trim(),
        moneda: this.empresa.moneda,
        formatoFecha: this.empresa.formatoFecha,
        bodegasActivas: 1, // Inicia con 1 bodega activa por defecto
        totalPrecios: 0,
        valorInventario: 0,
        alertasStock: 0
      };

      // Guardar y notificar al sistema mediante el servicio reactivo
      this.estadisticasService.cambiarEmpresaActiva(nuevaEmpresa);

      this.isLoading = false;
      console.log('%c[GESTOCK] Empresa obligatoria creada con éxito:', 'color: #10b981; font-weight: bold;', nuevaEmpresa);
      
      // Redirigir obligatoriamente al panel general de inventarios
      this.router.navigate(['/app/panel']);
    }, 800);
  }
}