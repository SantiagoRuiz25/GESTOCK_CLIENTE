import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EstadisticasService, Empresa } from '../../../services/estadisticas.service';

interface EmpresaItem {
  id: string;
  nombre: string;
  email: string;
  moneda: string;
  formatoFecha: string;
  estado: 'Activa' | 'Inactiva';
}

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './empresa.html',
  styleUrls: ['./empresa.css']
})
export class EmpresasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private estadisticasService = inject(EstadisticasService);

  empresasLista: EmpresaItem[] = [];
  mostrarModalCrear: boolean = false;
  nuevaEmpresaForm!: FormGroup;

  ngOnInit() {
    this.inicializarFormulario();
    const guardados = localStorage.getItem('gestock_empresas');
    if (guardados) {
      try {
        this.empresasLista = JSON.parse(guardados);
      } catch (e) {
        console.error('Error al parsear empresas del localStorage', e);
        this.cargarDatosIniciales();
      }
    } else {
      this.cargarDatosIniciales();
    }
  }

  inicializarFormulario() {
    this.nuevaEmpresaForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      moneda: ['USD - Dólar', Validators.required],
      formatoFecha: ['DD/MM/YYYY', Validators.required]
    });
  }

  cargarDatosIniciales() {
    this.empresasLista = [
      {
        id: 'EMP-001',
        nombre: 'GESTOCK Inc.',
        email: 'contacto@gestock.com',
        moneda: 'USD - Dólar',
        formatoFecha: 'DD/MM/YYYY',
        estado: 'Activa'
      },
      {
        id: 'EMP-002',
        nombre: 'Logística del Llano SAS',
        email: 'info@logisticallh.co',
        moneda: 'COP - Peso Colombiano',
        formatoFecha: 'YYYY-MM-DD',
        estado: 'Activa'
      },
      {
        id: 'EMP-003',
        nombre: 'Distribuciones Globales',
        email: 'ventas@distribucionesg.com',
        moneda: 'USD - Dólar',
        formatoFecha: 'MM/DD/YYYY',
        estado: 'Inactiva'
      }
    ];
    this.sincronizarStorage();
  }

  sincronizarStorage() {
    localStorage.setItem('gestock_empresas', JSON.stringify(this.empresasLista));
  }

  abrirModalCrear() {
    this.inicializarFormulario();
    this.mostrarModalCrear = true;
  }

  cerrarModalCrear() {
    this.mostrarModalCrear = false;
  }

  crearNuevaEmpresa() {
    if (this.nuevaEmpresaForm.invalid) return;

    const nuevaEmpresa: EmpresaItem = {
      id: `EMP-00${this.empresasLista.length + 1}`,
      nombre: this.nuevaEmpresaForm.value.nombre,
      email: this.nuevaEmpresaForm.value.email,
      moneda: this.nuevaEmpresaForm.value.moneda,
      formatoFecha: this.nuevaEmpresaForm.value.formatoFecha,
      estado: 'Activa'
    };

    this.empresasLista.unshift(nuevaEmpresa);
    this.sincronizarStorage();

    console.log('%c[GESTOCK] Nueva Empresa Creada (JSON):', 'color: #38bdf8; font-weight: bold;');
    console.log(JSON.stringify(nuevaEmpresa, null, 2));

    this.cerrarModalCrear();
  }

  seleccionarEmpresa(id: string) {
    const emp = this.empresasLista.find(e => e.id === id);
    if (emp) {
      console.log('%c[GESTOCK] Empresa seleccionada:', 'color: #34d399; font-weight: bold;');
      console.log(JSON.stringify(emp, null, 2));

      const empresaParaServicio: Empresa = {
        id: emp.id,
        nombre: emp.nombre,
        email: emp.email,
        moneda: emp.moneda,
        formatoFecha: emp.formatoFecha,
        bodegasActivas: 1,
        totalPrecios: 0,
        valorInventario: 0,
        alertasStock: 0
      };

      this.estadisticasService.cambiarEmpresaActiva(empresaParaServicio);
      localStorage.setItem('empresaIdSeleccionada', id);
      localStorage.setItem('empresa_activa', JSON.stringify(emp));

      this.router.navigate(['/app/panel']).catch(() => {
        window.location.hash = '/app/panel';
      });
    }
  }

  eliminarEmpresa(event: Event, id: string) {
    event.stopPropagation();
    if (confirm('¿Está seguro de eliminar esta empresa?')) {
      this.empresasLista = this.empresasLista.filter(e => e.id !== id);
      this.sincronizarStorage();
    }
  }
}