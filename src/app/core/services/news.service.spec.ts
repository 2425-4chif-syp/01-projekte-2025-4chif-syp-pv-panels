import { TestBed } from '@angular/core/testing';

import { NewsService } from './news.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('NewsService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [],
    providers: [NewsService, provideHttpClient(withInterceptorsFromDi())]
}));

  it('should be created', () => {
    const service: NewsService = TestBed.get(NewsService);
    expect(service).toBeTruthy();
  });
});
