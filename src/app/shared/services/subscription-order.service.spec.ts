import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SubscriptionOrderService } from './subscription-order.service';

describe('SubscriptionOrderService', () => {
  let service: SubscriptionOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SubscriptionOrderService]
    });
    service = TestBed.inject(SubscriptionOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
}); 