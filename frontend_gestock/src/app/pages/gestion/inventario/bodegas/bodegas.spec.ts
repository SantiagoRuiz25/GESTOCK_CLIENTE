import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BodegasComponent } from './bodegas';

describe('BodegasComponent', () => {
  let component: BodegasComponent;
  let fixture: ComponentFixture<BodegasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BodegasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BodegasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});