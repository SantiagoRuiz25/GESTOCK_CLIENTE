import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ReportesComponent } from './reportes';

describe('ReportesComponent', () => {
  let component: ReportesComponent;
  let fixture: ComponentFixture<ReportesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Standalone: va en `imports`, no en `declarations`. Ponerlo en
      // `declarations` es el error que rompía este spec.
      imports: [ReportesComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse el componente de reportes', () => {
    expect(component).toBeTruthy();
  });

  it('debe cambiar de tab activado', () => {
    component.cambiarTab('movimientos');
    expect(component.tabActiva).toBe('movimientos');
  });
});
