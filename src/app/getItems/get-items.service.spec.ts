import { TestBed } from '@angular/core/testing';

import { GetItemsService } from './get-items.service';

describe('GetItemsService', () => {
  let service: GetItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
