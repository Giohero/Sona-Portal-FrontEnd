import { TestBed } from '@angular/core/testing';

import { OrderWindowService } from './order-window.service';

describe('OrderWindowService', () => {
  let service: OrderWindowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderWindowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
