import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecepcionMercanciasComponent } from './recepcion-mercancias';

describe('RecepcionMercanciasComponent', () => {
  let component: RecepcionMercanciasComponent;
  let fixture: ComponentFixture<RecepcionMercanciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecepcionMercanciasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecepcionMercanciasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
