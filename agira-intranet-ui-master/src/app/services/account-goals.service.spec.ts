import { TestBed, inject } from '@angular/core/testing';

import { AccountGoalsService } from './account-goals.service';

describe('AccountGoalsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccountGoalsService]
    });
  });

  it('should be created', inject([AccountGoalsService], (service: AccountGoalsService) => {
    expect(service).toBeTruthy();
  }));
});
