import { TestBed } from '@angular/core/testing';

import { ConnectionsService } from './connections.service';

describe('ConnectionsService', () => {
  let service: ConnectionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConnectionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
