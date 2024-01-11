import { TestBed } from '@angular/core/testing';

import { IndexItemsService } from './index-items.service';

describe('IndexItemsService', () => {
  let service: IndexItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndexItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
