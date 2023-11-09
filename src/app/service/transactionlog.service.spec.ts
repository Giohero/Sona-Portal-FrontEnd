import { TestBed } from '@angular/core/testing';

import { TransactionlogService } from './transactionlog.service';

describe('TransactionlogService', () => {
  let service: TransactionlogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionlogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
