import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './roles-yusuarios.html',
  styleUrls: ['./roles-yusuarios.css']
})
export class RolesUsuariosComponent implements OnInit {
  
  // Lista de usuarios simulada
  listaUsuarios: any[] = [
    { id: 1, nombre: 'Carlos Pérez', email: 'carlos@gestock.com', rol: 'Administrador', activo: true, estadoTexto: 'En línea', horasTrabajadas: 42 },
    { id: 2, nombre: 'Ana Gómez', email: 'ana@gestock.com', rol: 'Auditor', activo: true, estadoTexto: 'En línea', horasTrabajadas: 38 },
    { id: 3, nombre: 'Luis Torres', email: 'luis@gestock.com', rol: 'Supervisor', activo: false, estadoTexto: 'Desconectado', horasTrabajadas: 40 },
    { id: 4, nombre: 'Sofia Martínez', email: 'sofia@gestock.com', rol: 'Operario', activo: true, estadoTexto: 'En línea', horasTrabajadas: 45 }
  ];

  // Permisos basados exactamente en los módulos del menú lateral de Gestock
  listaPermisosDisponibles: string[] = [
    'Acceso al Panel',
    'Gestión de Empresas',
    'Control de Inventario',
    'Gestión de Recepción',
    'Ver Historial Logístico',
    'Gestión de Auditorías',
    'Administración de Roles y Usuarios',
    'Control de Envíos',
    'Módulo de Programación',
    'Gestión de Incidencias',
    'Generación de Reportes',
    'Configuración del Sistema'
  ];

  usuarioSeleccionado: any = null;
  modoCrear: boolean = false;
  
  nuevoUsuarioForm!: FormGroup;
  rolForm!: FormGroup;

  mensajeAlerta: string = '';
  tipoAlerta: string = 'success';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.inicializarFormularios();
  }

  inicializarFormularios(): void {
    this.nuevoUsuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      rol: ['', Validators.required],
      horasTrabajadas: [0, [Validators.required, Validators.min(1)]]
    });

    this.rolForm = this.fb.group({
      nombreRol: ['', Validators.required],
      descripcion: [''],
      permisos: this.fb.array(this.listaPermisosDisponibles.map(() => false))
    });
  }

  get permisosArray(): FormArray {
    return this.rolForm.get('permisos') as FormArray;
  }

  contarActivos(): number {
    return this.listaUsuarios.filter(u => u.activo).length;
  }

  totalHorasTrabajadas(): number {
    return this.listaUsuarios.reduce((acc, curr) => acc + (curr.horasTrabajadas || 0), 0);
  }

  abrirModalCrear(): void {
    this.modoCrear = true;
    this.usuarioSeleccionado = null;
    this.nuevoUsuarioForm.reset({ horasTrabajadas: 40 });
  }

  volverALista(): void {
    this.modoCrear = false;
    this.usuarioSeleccionado = null;
  }

  seleccionarUsuario(user: any): void {
    this.usuarioSeleccionado = user;
    this.modoCrear = false;
    
    // Simular permisos precargados según el rol
    const permisosSimulados = this.listaPermisosDisponibles.map(permiso => {
      if (user.rol === 'Administrador') return true;
      if (user.rol === 'Auditor' && permiso.includes('Auditorías')) return true;
      if (user.rol === 'Supervisor' && (permiso.includes('Inventario') || permiso.includes('Panel'))) return true;
      return false;
    });

    this.rolForm.patchValue({
      nombreRol: user.rol,
      descripcion: `Configuración actual para ${user.nombre}`
    });

    this.permisosArray.clear();
    permisosSimulados.forEach(p => this.permisosArray.push(this.fb.control(p)));
  }

  onRolSelectChange(event: any): void {
    const rolSeleccionado = event.target.value;
    // Ajustar permisos por defecto según el rol elegido
    const nuevosPermisos = this.listaPermisosDisponibles.map(permiso => {
      if (rolSeleccionado === 'Administrador') return true;
      if (rolSeleccionado === 'Auditor') return permiso.includes('Auditorías') || permiso.includes('Reportes');
      if (rolSeleccionado === 'Supervisor') return permiso.includes('Inventario') || permiso.includes('Panel') || permiso.includes('Envíos');
      return permiso.includes('Inventario') || permiso.includes('Recepción');
    });

    this.permisosArray.clear();
    nuevosPermisos.forEach(p => this.permisosArray.push(this.fb.control(p)));
  }

  guardarNuevoUsuario(): void {
    if (this.nuevoUsuarioForm.valid) {
      const nuevo = {
        id: this.listaUsuarios.length + 1,
        ...this.nuevoUsuarioForm.value,
        activo: true,
        estadoTexto: 'En línea'
      };
      this.listaUsuarios.push(nuevo);
      this.mostrarAlerta('Usuario registrado exitosamente', 'success');
      this.volverALista();
    }
  }

  guardarRol(): void {
    if (this.usuarioSeleccionado) {
      this.usuarioSeleccionado.rol = this.rolForm.value.nombreRol;
      this.mostrarAlerta(`Permisos y rol actualizados para ${this.usuarioSeleccionado.nombre}`, 'success');
      this.volverALista();
    }
  }

  mostrarAlerta(mensaje: string, tipo: string): void {
    this.mensajeAlerta = mensaje;
    this.tipoAlerta = tipo;
    setTimeout(() => {
      this.mensajeAlerta = '';
    }, 3500);
  }
}