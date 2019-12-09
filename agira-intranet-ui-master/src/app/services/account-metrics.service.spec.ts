import { TestBed, inject } from '@angular/core/testing';

import { AccountMetricsService } from './account-metrics.service';

describe('AccountMetricsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccountMetricsService]
    });
  });

  it('should be created', inject([AccountMetricsService], (service: AccountMetricsService) => {
    expect(service).toBeTruthy();
  }));
});
