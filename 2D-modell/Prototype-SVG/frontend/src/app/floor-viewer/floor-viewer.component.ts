import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-floor-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <button *ngFor="let floor of floors" (click)="selectFloor(floor)">
        Stockwerk {{floor}}
      </button>
    </div>
    <div [innerHTML]="currentSvg"></div>
  `,
  styles: []
})
export class FloorViewerComponent implements OnInit {
  floors = [1, 2, 3, 4];
  currentSvg: SafeHtml;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {
    this.currentSvg = this.sanitizer.bypassSecurityTrustHtml('');
  }

  ngOnInit() {
    this.selectFloor(1);
  }

  selectFloor(floor: number) {
    this.http.get(`assets/svg/geschoss${floor}.svg`, { responseType: 'text' })
      .subscribe(svg => {
        this.currentSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
      });
  }
}
