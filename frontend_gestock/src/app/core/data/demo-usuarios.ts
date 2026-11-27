/**
 * Datos semilla para el modo demostración (`useMockApi: true`).
 *
 * AVISO DE SEGURIDAD, LÉELO ANTES DE USAR:
 *
 * Estas credenciales NO son un límite de seguridad. Todo este código se
 * ejecuta en el navegador del usuario, así que cualquiera con DevTools puede
 * leerlas, saltarse el login o editar el `localStorage` para convertirse en
 * administrador. Hashear las contraseñas aquí tampoco ayudaría: el hash y el
 * sal viajarían en el mismo bundle, lo cual es puro teatro de seguridad.
 *
 * La única verificación de contraseña que importa es la que hace el servidor.
 * Cuando el backend Go/Django esté listo, pon `useMockApi: false` en
 * `environment.development.ts` y este archivo deja de usarse por completo:
 * la autenticación pasa a ocurrir contra el endpoint real.
 *
 * Sirven para poder desarrollar y demostrar la interfaz antes de que exista
 * la API, nada más. */

export interface DemoUsuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  password: string;
}

export const DEMO_USUARIOS: readonly DemoUsuario[] = [
  { id: 1, nombre: 'Admin System', email: 'admin@gestock.com', rol: 'Administrador', password: '123' },
  { id: 2, nombre: 'Supervisor Logística', email: 'supervisor@gestock.com', rol: 'Supervisor', password: '123' },
  { id: 3, nombre: 'Técnico Mantenimiento', email: 'tecnico@gestock.com', rol: 'Técnico de Mantenimiento', password: '123' },
  { id: 4, nombre: 'Auditor General', email: 'auditor@gestock.com', rol: 'Auditor', password: '123' },
  { id: 5, nombre: 'Operario Almacén', email: 'operario@gestock.com', rol: 'Operario', password: '123' },
];
