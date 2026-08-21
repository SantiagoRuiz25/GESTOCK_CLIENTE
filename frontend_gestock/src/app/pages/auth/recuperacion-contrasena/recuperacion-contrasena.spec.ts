import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecuperacionContrasena } from './recuperacion-contrasena';

describe('RecuperacionContrasena', () => {
  let component: RecuperacionContrasena;
  let fixture: ComponentFixture<RecuperacionContrasena>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecuperacionContrasena],
    }).compileComponents();

    fixture = TestBed.createComponent(RecuperacionContrasena);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
