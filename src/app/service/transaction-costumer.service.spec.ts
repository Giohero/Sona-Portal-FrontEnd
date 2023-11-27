import { TestBed } from '@angular/core/testing';

import { TransactionCostumerService } from './transaction-costumer.service';

describe('TransactionCostumerService', () => {
  let service: TransactionCostumerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionCostumerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
