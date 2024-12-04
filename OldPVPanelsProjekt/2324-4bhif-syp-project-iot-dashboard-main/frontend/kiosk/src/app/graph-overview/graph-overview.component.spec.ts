import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphOverviewComponent } from './graph-overview.component';

describe('GraphOverviewComponent', () => {
  let component: GraphOverviewComponent;
  let fixture: ComponentFixture<GraphOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphOverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GraphOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
