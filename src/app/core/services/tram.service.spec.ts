import { TestBed } from '@angular/core/testing';

import { TramService } from './tram.service';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('TramService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [],
    providers: [TramService, provideHttpClient(withInterceptorsFromDi())]
}));

  it('should be created', () => {
    const service: TramService = TestBed.get(TramService);
    expect(service).toBeTruthy();
  });
});
