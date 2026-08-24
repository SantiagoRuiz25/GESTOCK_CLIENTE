import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistorialLogistico } from './historial-logistico';

describe('HistorialLogistico', () => {
  let component: HistorialLogistico;
  let fixture: ComponentFixture<HistorialLogistico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialLogistico],
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialLogistico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
