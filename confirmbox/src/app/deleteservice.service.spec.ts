import { TestBed } from '@angular/core/testing';

import { DeleteserviceService } from './deleteservice.service';

describe('DeleteserviceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DeleteserviceService = TestBed.get(DeleteserviceService);
    expect(service).toBeTruthy();
  });
});
