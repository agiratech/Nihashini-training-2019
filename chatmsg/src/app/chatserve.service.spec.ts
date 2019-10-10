import { TestBed } from '@angular/core/testing';

import { ChatserveService } from './chatserve.service';

describe('ChatserveService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChatserveService = TestBed.get(ChatserveService);
    expect(service).toBeTruthy();
  });
});
