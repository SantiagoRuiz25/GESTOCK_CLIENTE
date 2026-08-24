import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecepcionMercancias } from './recepcion-mercancias';

describe('RecepcionMercancias', () => {
  let component: RecepcionMercancias;
  let fixture: ComponentFixture<RecepcionMercancias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecepcionMercancias],
    }).compileComponents();

    fixture = TestBed.createComponent(RecepcionMercancias);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
