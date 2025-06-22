import { Component } from '@angular/core';
import { FloorViewerComponent } from './floor-viewer/floor-viewer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FloorViewerComponent],
  template: `<app-floor-viewer></app-floor-viewer>`
})
export class AppComponent {}
