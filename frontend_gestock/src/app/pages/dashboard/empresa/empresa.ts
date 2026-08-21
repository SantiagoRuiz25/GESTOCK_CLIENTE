import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './empresa.html',
  styleUrl: './empresa.css'
})
export class EmpresaComponent implements OnInit {
  nuevaEmpresaForm: FormGroup;
  mostrarModalCrear: boolean = false;
  
  empresasLista = [
    { id: 1, nombre: 'GESTOCK Inc.', email: 'contacto@gestock.com', moneda: 'USD - Dólar', formatoFecha: 'DD/MM/YYYY', estado: 'Activa' },
    { id: 2, nombre: 'Logística del Llano SAS', email: 'info@logisticalh.co', moneda: 'COP - Peso Colombiano', formatoFecha: 'YYYY-MM-DD', estado: 'Activa' },
    { id: 3, nombre: 'Distribuciones Globales', email: 'ventas@distribucionesg.com', moneda: 'USD - Dólar', formatoFecha: 'MM/DD/YYYY', estado: 'Inactiva' }
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    this.nuevaEmpresaForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      moneda: ['USD - Dólar', Validators.required],
      formatoFecha: ['DD/MM/YYYY', Validators.required]
    });
  }

  ngOnInit(): void {}

  abrirModalCrear() {
    this.mostrarModalCrear = true;
  }

  cerrarModalCrear() {
    this.mostrarModalCrear = false;
    this.nuevaEmpresaForm.reset({
      moneda: 'USD - Dólar',
      formatoFecha: 'DD/MM/YYYY'
    });
  }

  crearNuevaEmpresa() {
    if (this.nuevaEmpresaForm.valid) {
      const nuevaEmpresa = {
        id: Date.now(),
        ...this.nuevaEmpresaForm.value,
        estado: 'Activa'
      };
      this.empresasLista.push(nuevaEmpresa);
      this.cerrarModalCrear();
    }
  }

  seleccionarEmpresa(id: number) {
    this.router.navigate(['/app/panel', id]);
  }

  eliminarEmpresa(event: Event, id: number) {
    event.stopPropagation();
    this.empresasLista = this.empresasLista.filter(e => e.id !== id);
  }
}