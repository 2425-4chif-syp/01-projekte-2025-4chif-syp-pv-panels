import { TestBed } from '@angular/core/testing';

import { SensortypeService } from './sensortype.service';

describe('SensortypeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SensortypeService = TestBed.get(SensortypeService);
    expect(service).toBeTruthy();
  });
});
