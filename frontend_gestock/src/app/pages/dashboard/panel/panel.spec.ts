import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanelComponent as Panel } from './panel';

describe('Panel', () => {
  let component: Panel;
  let fixture: ComponentFixture<Panel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Panel],
    }).compileComponents();

    fixture = TestBed.createComponent(Panel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
