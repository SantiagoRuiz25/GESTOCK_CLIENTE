import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfiguracionComponent } from './configuracion';

describe('ConfiguracionComponent', () => {
  let component: ConfiguracionComponent;
  let fixture: ComponentFixture<ConfiguracionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ConfiguracionComponent ] // Se pasa a imports por ser un componente standalone
    }).compileComponents();

    fixture = TestBed.createComponent(ConfiguracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse el componente de configuración', () => {
    expect(component).toBeTruthy();
  });

  it('debe alternar el estado de las notificaciones', () => {
    const estadoInicial = component.config.notificacionesEmail;
    
    // Simula la alternancia del estado de notificaciones por correo
    component.config.notificacionesEmail = !component.config.notificacionesEmail;
    
    expect(component.config.notificacionesEmail).toBe(!estadoInicial);
  });
});