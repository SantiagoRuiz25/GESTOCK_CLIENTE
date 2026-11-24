import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LoginComponent } from './login';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      // El componente usa `RouterModule` en su plantilla y `Router` por
      // inyección. Sin el provider, falla con NG0201.
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe rechazar un correo inválido sin llamar a la API', () => {
    component.credentials = { email: 'no-es-un-correo', password: '123', rememberMe: false };
    component.onLogin();

    expect(component.errorMessage).toContain('correo electrónico válido');
    expect(component.isLoading).toBe(false);
  });

  it('debe exigir correo y contraseña', () => {
    component.credentials = { email: '', password: '', rememberMe: false };
    component.onLogin();

    expect(component.errorMessage).toContain('obligatorios');
  });
});
