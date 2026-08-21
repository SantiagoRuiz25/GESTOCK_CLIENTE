import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertasControlComponent } from './alertas-control';

describe('AlertasControl', () => {
  let component: AlertasControlComponent;
  let fixture: ComponentFixture<AlertasControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertasControlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertasControlComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
