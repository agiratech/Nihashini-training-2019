import { TestBed } from '@angular/core/testing';

import { NotecardService } from './notecard.service';

describe('NotecardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NotecardService = TestBed.get(NotecardService);
    expect(service).toBeTruthy();
  });
});
