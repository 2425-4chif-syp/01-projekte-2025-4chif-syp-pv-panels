import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NewsListComponent } from './news-list.component';
import { NewsComponent } from '../news/news.component';
import { NewsService } from 'src/app/core/services/news.service';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('NewsListComponent', () => {
  let component: NewsListComponent;
  let fixture: ComponentFixture<NewsListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [NewsListComponent, NewsComponent],
    imports: [],
    providers: [NewsService, provideHttpClient(withInterceptorsFromDi())]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
