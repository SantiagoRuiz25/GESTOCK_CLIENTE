import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

// `vi.hoisted` corre ANTES de que se resuelvan los imports de arriba, que es
// justo lo que hace falta: GSAP con ScrollTrigger y Three.js consultan
// `matchMedia` al cargarse el módulo, y jsdom no lo implementa. Poner el stub
// en un `beforeEach` arrive demasiado tarde y la suite moría con
// `_win.matchMedia is not a function` antes de llegar al primer `it`.
vi.hoisted(() => {
  if (typeof globalThis.matchMedia !== 'function') {
    Object.defineProperty(globalThis, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }),
    });
  }
});

import { PaginaComponent } from './pagina';
import { SessionService } from '../core/services/session.service';

describe('PaginaComponent', () => {
  let component: PaginaComponent;
  let fixture: ComponentFixture<PaginaComponent>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PaginaComponent],
      providers: [{ provide: Router, useValue: routerMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe enviar a /auth si no hay sesión iniciada', () => {
    // Sin sesión, `irAlSistema` debe llevar al login, no a la zona privada.
    component.irAlSistema();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth']);
  });

  it('debe ir a /app si el usuario está autenticado', () => {
    const sesion = TestBed.inject(SessionService);
    // Login en modo demo (`useMockApi`), que es lo que hay en test.
    sesion.login('admin@gestock.com', '123').subscribe();

    component.irAlSistema();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app']);

    sesion.logout({ navegar: false });
  });
});