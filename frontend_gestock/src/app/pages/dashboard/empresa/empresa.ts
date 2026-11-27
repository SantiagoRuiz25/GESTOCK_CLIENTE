import { finalize } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import type { EmpresaApi } from '../../../services/empresas.service';

import { ChangeDetectorRef } from '@angular/core';
import { EmpresasService, etiquetaMoneda } from '../../../services/empresas.service';

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
  private readonly apiEmpresas = inject(EmpresasService);
  private readonly cambiosVista = inject(ChangeDetectorRef);
  private readonly toast = inject(ToastService);

  guardando = false;
  idEnEdicion: string | null = null;
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private estadisticasService = inject(EstadisticasService);

  empresasLista: EmpresaItem[] = [];
  mostrarModalCrear: boolean = false;
  nuevaEmpresaForm!: FormGroup;

  ngOnInit(): void {
    this.inicializarFormulario();
    this.apiEmpresas.listar().subscribe({
      next: (empresas) => {
        this.empresasLista = empresas.map((empresa) => ({
          id: String(empresa.id),
          nombre: empresa.nombre,
          email: empresa.correo,
          moneda: etiquetaMoneda[empresa.moneda],
          formatoFecha: empresa.formato_fecha,
          estado: empresa.activo ? 'Activa' : 'Inactiva',
        }));
        this.cambiosVista.markForCheck();
      },
      error: (error: unknown) => {
        console.error('No se pudieron cargar las empresas del MID', error);
      },
    });
  }

  inicializarFormulario() {
    this.nuevaEmpresaForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      moneda: ['USD - Dólar', Validators.required],
      formatoFecha: ['DD/MM/YYYY', Validators.required]
      
    });
  }

  abrirModalCrear() {
    this.idEnEdicion = null;
    this.inicializarFormulario();
    this.mostrarModalCrear = true;
  }

  cerrarModalCrear() {
    this.mostrarModalCrear = false;
  }

  abrirModalEditar(event: Event, empresa: EmpresaItem): void {
    event.stopPropagation();
    if (this.guardando) return;

    this.idEnEdicion = empresa.id;
    this.inicializarFormulario();
    this.nuevaEmpresaForm.patchValue({
      nombre: empresa.nombre,
      email: empresa.email,
      moneda: empresa.moneda,
      formatoFecha: empresa.formatoFecha,
    });
    this.mostrarModalCrear = true;
  }

  crearNuevaEmpresa(): void {
    if (this.guardando || this.nuevaEmpresaForm.invalid) return;

    const id = this.idEnEdicion;
    const formulario = this.nuevaEmpresaForm.getRawValue();
    const peticion = id === null
      ? this.apiEmpresas.crear(formulario)
      : this.apiEmpresas.actualizar(id, formulario);

    this.guardando = true;
    peticion.pipe(finalize(() => {
      this.guardando = false;
      this.cambiosVista.markForCheck();
    })).subscribe({
      next: (empresa) => {
        const guardada = this.convertirEmpresa(empresa);
        this.empresasLista = id === null
          ? [guardada, ...this.empresasLista]
          : this.empresasLista.map((actual) => actual.id === id ? guardada : actual);

        this.cerrarModalCrear();
        this.toast.exito(id === null ? 'Empresa creada con éxito.' : 'Empresa actualizada con éxito.');
      },
      error: (error: unknown) =>
        this.toast.errorDesdeApi(error, 'No se pudo guardar la empresa.'),
    });
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

  eliminarEmpresa(event: Event, id: string): void {
    event.stopPropagation();
    const empresa = this.empresasLista.find((actual) => actual.id === id);
    if (!empresa || empresa.estado !== 'Activa' || this.guardando) return;
    if (!window.confirm(`¿Desactivar la empresa ${empresa.nombre}?`)) return;

    this.guardando = true;
    this.apiEmpresas.desactivar(id).pipe(finalize(() => {
      this.guardando = false;
      this.cambiosVista.markForCheck();
    })).subscribe({
      next: () => {
        this.empresasLista = this.empresasLista.map((actual) =>
          actual.id === id ? { ...actual, estado: 'Inactiva' } : actual);
        this.toast.exito('Empresa desactivada con éxito.');
      },
      error: (error: unknown) =>
        this.toast.errorDesdeApi(error, 'No se pudo desactivar la empresa.'),
    });
  }

  private convertirEmpresa(empresa: EmpresaApi): EmpresaItem {
    return {
      id: String(empresa.id),
      nombre: empresa.nombre,
      email: empresa.correo,
      moneda: etiquetaMoneda[empresa.moneda],
      formatoFecha: empresa.formato_fecha,
      estado: empresa.activo ? 'Activa' : 'Inactiva',
    };
  }
}