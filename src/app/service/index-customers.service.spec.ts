import { TestBed } from '@angular/core/testing';

import { IndexCustomersService } from './index-customers.service';

describe('IndexCustomersService', () => {
  let service: IndexCustomersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndexCustomersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
