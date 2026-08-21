import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarProductosComponent } from './registrar-productos';

describe('RegistrarProductosComponent', () => {
  let component: RegistrarProductosComponent;
  let fixture: ComponentFixture<RegistrarProductosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarProductosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});