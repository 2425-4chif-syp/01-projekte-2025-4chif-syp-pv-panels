import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FloorViewerComponent } from './floor-viewer.component';

describe('FloorViewerComponent', () => {
  let component: FloorViewerComponent;
  let fixture: ComponentFixture<FloorViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorViewerComponent]
    })
    .compileComponents();
    

    fixture = TestBed.createComponent(FloorViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
