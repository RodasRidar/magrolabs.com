import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { refLinkGuard } from './ref-link.guard';

describe('refLinkGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => refLinkGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
