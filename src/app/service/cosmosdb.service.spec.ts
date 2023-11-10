import { TestBed } from '@angular/core/testing';

import { CosmosdbService } from './cosmosdb.service';

describe('CosmosdbService', () => {
  let service: CosmosdbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CosmosdbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
