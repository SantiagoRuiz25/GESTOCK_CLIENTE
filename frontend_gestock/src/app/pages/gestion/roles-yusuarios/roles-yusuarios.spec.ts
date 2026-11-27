import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RolesUsuariosComponent } from './roles-yusuarios';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('RolesUsuariosComponent', () => {
  let component: RolesUsuariosComponent;
  let fixture: ComponentFixture<RolesUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesUsuariosComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RolesUsuariosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});