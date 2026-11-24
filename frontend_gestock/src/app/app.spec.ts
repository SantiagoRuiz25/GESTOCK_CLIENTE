import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      // `App` monta un `<router-outlet>` y el contenedor de toasts, que
      // necesita el router inyectado aunque no se navegue en el test.
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debe montar el contenedor de notificaciones', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    // El contenedor de toasts vive en la raíz para que también funcione
    // fuera del layout, en la landing y en las pantallas de autenticación.
    expect(compiled.querySelector('app-toast-container')).toBeTruthy();
  });
});
