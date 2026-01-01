import { TestBed } from '@angular/core/testing';

import { Cortinas } from './cortinas';

describe('Cortinas', () => {
  let service: Cortinas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cortinas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
