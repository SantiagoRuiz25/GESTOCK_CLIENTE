import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramacionMantenimientoComponent } from './programacion-mantenimiento.component';

describe('ProgramacionMantenimientoComponent', () => {
  let component: ProgramacionMantenimientoComponent;
  let fixture: ComponentFixture<ProgramacionMantenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramacionMantenimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramacionMantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
