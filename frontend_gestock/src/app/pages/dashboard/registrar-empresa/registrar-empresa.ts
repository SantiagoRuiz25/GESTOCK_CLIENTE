import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registrar-empresa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './registrar-empresa.html',
  styleUrls: ['./registrar-empresa.css']
})
export class RegistrarEmpresaComponent {

  constructor(private router: Router) {}

  crearYSalir(nombre: string, email: string, moneda: string, formatoFecha: string) {
    const nuevaEmpresa = {
      id: `EMP-${Date.now().toString().slice(-3)}`,
      nombre: nombre || 'Empresa Creada',
      email: email || 'contacto@empresa.com',
      moneda: moneda || 'USD - Dólar',
      formatoFecha: formatoFecha || 'DD/MM/YYYY',
      estado: 'Activa'
    };

    // 1. Guardar empresas y sesión activa en LocalStorage con claves unificadas
    try {
      const localData = localStorage.getItem('gestock_empresas');
      const empresas = localData ? JSON.parse(localData) : [];
      empresas.unshift(nuevaEmpresa);

      localStorage.setItem('gestock_empresas', JSON.stringify(empresas));
      localStorage.setItem('empresa_activa', JSON.stringify(nuevaEmpresa));
      localStorage.setItem('gestock_empresa_activa', JSON.stringify(nuevaEmpresa));
      localStorage.setItem('isLoggedIn', 'true');
    } catch (e) {
      console.error('Error guardando datos:', e);
    }

    // 2. Navegar al panel de forma segura
    this.router.navigate(['/app/panel']).catch(() => {
      window.location.hash = '/app/panel';
    });
  }
}