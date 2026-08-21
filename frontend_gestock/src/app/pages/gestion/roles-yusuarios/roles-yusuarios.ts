import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-roles-yusuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './roles-yusuarios.html',
  styleUrls: ['./roles-yusuarios.css']
})
export class RolesUsuariosComponent {
  rolForm: FormGroup;
  nuevoUsuarioForm: FormGroup;
  
  listaUsuarios = [
    { id: 1, nombre: 'Carlos Pérez', email: 'carlos.perez@gestock.com', rol: 'Almacenista', activo: true, estadoTexto: 'Activo ahora', horasTrabajadas: 38 },
    { id: 2, nombre: 'Ana Gómez', email: 'ana.gomez@gestock.com', rol: 'Administrador', activo: true, estadoTexto: 'Activo hace 5 min', horasTrabajadas: 45 },
    { id: 3, nombre: 'Luis Torres', email: 'luis.torres@gestock.com', rol: 'Auditor', activo: false, estadoTexto: 'Inactivo hace 3 horas', horasTrabajadas: 24 }
  ];

  usuarioSeleccionado: any = null;
  modoCrear: boolean = false;

  mensajeAlerta: string | null = null;
  tipoAlerta: 'success' | 'info' = 'success';

  listaPermisosDisponibles = [
    'Visualización de permisos del sistema',
    'Asignación de permisos a usuario',
    'Revocación de accesos asignados',
    'Registro y alta de nuevos productos',
    'Control de existencias y stock en bodegas',
    'Auditoría y revisión de bitácoras'
  ];

  permisosPorRol: { [key: string]: boolean[] } = {
    'Administrador': [true, true, true, true, true, true],
    'Almacenista': [true, false, false, true, true, false],
    'Auditor': [true, false, false, false, false, true]
  };

  constructor(private fb: FormBuilder) {
    this.rolForm = this.fb.group({
      nombreRol: ['', Validators.required],
      descripcion: [''],
      permisos: this.fb.array(this.listaPermisosDisponibles.map(() => false))
    });

    this.nuevoUsuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      rol: ['Almacenista', Validators.required],
      horasTrabajadas: [40, [Validators.required, Validators.min(1)]]
    });
  }

  get permisosArray() {
    return this.rolForm.get('permisos') as FormArray;
  }

  contarActivos(): number {
    return this.listaUsuarios.filter(u => u.activo).length;
  }

  totalHorasTrabajadas(): number {
    return this.listaUsuarios.reduce((acc, curr) => acc + curr.horasTrabajadas, 0);
  }

  mostrarNotificacion(mensaje: string, tipo: 'success' | 'info' = 'success') {
    this.mensajeAlerta = mensaje;
    this.tipoAlerta = tipo;
    setTimeout(() => {
      this.mensajeAlerta = null;
    }, 3500);
  }

  abrirModalCrear() {
    this.modoCrear = true;
    this.usuarioSeleccionado = null;
    this.nuevoUsuarioForm.reset({ rol: 'Almacenista', horasTrabajadas: 40 });
  }

  seleccionarUsuario(user: any) {
    this.usuarioSeleccionado = user;
    this.modoCrear = false;
    
    const permisosDefecto = this.permisosPorRol[user.rol] || this.listaPermisosDisponibles.map(() => false);
    
    this.rolForm.patchValue({
      nombreRol: user.rol,
      descripcion: `Configuración activa para ${user.nombre}`
    });

    const formArray = this.permisosArray;
    permisosDefecto.forEach((val, idx) => {
      formArray.at(idx).setValue(val);
    });
  }

  onRolSelectChange(event: any) {
    const rolSeleccionado = event.target.value;
    const permisosDefecto = this.permisosPorRol[rolSeleccionado] || this.listaPermisosDisponibles.map(() => false);
    
    const formArray = this.permisosArray;
    permisosDefecto.forEach((val, idx) => {
      formArray.at(idx).setValue(val);
    });
  }

  onRolNuevoChange(event: any) {}

  volverALista() {
    this.usuarioSeleccionado = null;
    this.modoCrear = false;
    this.rolForm.reset();
  }

  guardarNuevoUsuario() {
    if (this.nuevoUsuarioForm.valid) {
      const val = this.nuevoUsuarioForm.value;
      const nuevoUser = {
        id: this.listaUsuarios.length + 1,
        nombre: val.nombre,
        email: val.email,
        rol: val.rol,
        activo: true,
        estadoTexto: 'Activo ahora',
        horasTrabajadas: Number(val.horasTrabajadas)
      };
      this.listaUsuarios.push(nuevoUser);
      this.mostrarNotificacion(`¡Usuario ${nuevoUser.nombre} registrado con éxito!`, 'success');
      this.volverALista();
    }
  }

  guardarRol() {
    if (this.rolForm.valid && this.usuarioSeleccionado) {
      this.usuarioSeleccionado.rol = this.rolForm.value.nombreRol;
      this.mostrarNotificacion(`¡Permisos y rol actualizados para ${this.usuarioSeleccionado.nombre}!`, 'success');
      this.volverALista();
    }
  }
}