import { TestBed, inject } from '@angular/core/testing';

import { TemplatesMetricService } from './templates-metric.service';

describe('TemplatesMetricService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TemplatesMetricService]
    });
  });

  it('should be created', inject([TemplatesMetricService], (service: TemplatesMetricService) => {
    expect(service).toBeTruthy();
  }));
});
