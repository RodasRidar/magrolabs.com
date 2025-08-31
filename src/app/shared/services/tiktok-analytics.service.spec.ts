import { TestBed } from '@angular/core/testing';

import { TiktokAnalyticsService } from './tiktok-analytics.service';

describe('TiktokAnalyticsService', () => {
  let service: TiktokAnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TiktokAnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
