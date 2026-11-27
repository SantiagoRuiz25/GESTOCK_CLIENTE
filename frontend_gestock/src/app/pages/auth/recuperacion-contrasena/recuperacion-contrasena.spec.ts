import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecuperacionContrasenaComponent } from './recuperacion-contrasena';

describe('RecuperacionContrasenaComponent', () => {
  let component: RecuperacionContrasenaComponent;
  let fixture: ComponentFixture<RecuperacionContrasenaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecuperacionContrasenaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecuperacionContrasenaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
