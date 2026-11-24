import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { RolesUsuariosService } from './services';

describe('RolesUsuariosService', () => {
  let service: RolesUsuariosService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // El servicio se obtiene con `inject`, no con `createComponent`: un
      // servicio no es un componente y no se puede instanciar como tal.
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(RolesUsuariosService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
