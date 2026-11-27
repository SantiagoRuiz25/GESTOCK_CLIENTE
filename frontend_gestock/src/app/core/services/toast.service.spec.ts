import { TestBed } from '@angular/core/testing';

import { ToastService } from './toast.service';
import { ApiError } from '../models/api.model';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe apilar los toasts en orden de llegada', () => {
    service.exito('Guardado');
    service.aviso('Revisa el stock');

    const pila = service.toasts();
    expect(pila).toHaveLength(2);
    expect(pila[0].mensaje).toBe('Guardado');
    expect(pila[1].mensaje).toBe('Revisa el stock');
  });

  it('debe descartar los más antiguos cuando se supera el máximo', () => {
    for (let i = 1; i <= 6; i++) {
      service.info(`Aviso ${i}`);
    }

    const pila = service.toasts();
    expect(pila).toHaveLength(4);
    // Se conservan los últimos cuatro, no los primeros.
    expect(pila[0].mensaje).toBe('Aviso 3');
    expect(pila[3].mensaje).toBe('Aviso 6');
  });

  it('debe cerrar el toast pasado el tiempo de su tipo', () => {
    const id = service.mostrar('Guardado', 'exito');
    expect(service.toasts()).toHaveLength(1);

    vi.advanceTimersByTime(4000);
    expect(service.toasts()).toHaveLength(0);

    // El id se liberó, así que un toast nuevo no colisiona con el anterior.
    expect(service.mostrar('Otro', 'exito')).toBeGreaterThan(id);
  });

  it('debe dar más tiempo a los errores que a los éxitos', () => {
    service.error('Falló el guardado');
    vi.advanceTimersByTime(4000);
    // A los 4 s el error sigue visible; un éxito ya se habría cerrado.
    expect(service.toasts()).toHaveLength(1);
  });

  it('debe cerrar manualmente y cancelar el temporizador', () => {
    const id = service.mostrar('Guardado', 'exito');
    service.cerrar(id);

    expect(service.toasts()).toHaveLength(0);

    // Si el temporizador siguiera vivo, no rompería nada observable, pero
    // se limpia la entrada para no acumular Map por toda la sesión.
    vi.advanceTimersByTime(10_000);
    expect(service.toasts()).toHaveLength(0);
  });

  it('debe mostrar el mensaje normalizado de un ApiError', () => {
    service.errorDesdeApi(
      new ApiError({ status: 403, mensaje: 'No tienes permisos.' }),
    );

    expect(service.toasts()[0].mensaje).toBe('No tienes permisos.');
    expect(service.toasts()[0].tipo).toBe('error');
  });

  it('debe recurrir al texto alternativo ante un error desconocido', () => {
    service.errorDesdeApi(new Error('boom'), 'No se pudo guardar.');

    expect(service.toasts()[0].mensaje).toBe('No se pudo guardar.');
  });

  it('debe vaciar la pila entera con cerrarTodos', () => {
    service.exito('A');
    service.error('B');
    service.cerrarTodos();

    expect(service.toasts()).toHaveLength(0);
  });
});
