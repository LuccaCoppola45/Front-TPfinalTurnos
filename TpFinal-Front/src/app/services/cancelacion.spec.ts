import { TestBed } from '@angular/core/testing';
import { CancelacionService } from './cancelacionService';

describe('CancelacionService', () => {
  let service: CancelacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CancelacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
