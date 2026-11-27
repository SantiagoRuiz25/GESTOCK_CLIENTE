import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarEmpresaComponent } from './registrar-empresa';

describe('RegistrarEmpresaComponent', () => {
  let component: RegistrarEmpresaComponent;
  let fixture: ComponentFixture<RegistrarEmpresaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarEmpresaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarEmpresaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
