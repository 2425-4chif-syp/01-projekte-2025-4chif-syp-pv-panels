import { Component, Input } from '@angular/core';
import { Graph } from "../model/Graph";
import { DomSanitizer } from "@angular/platform-browser";
import { NgIf } from "@angular/common";
import {WeatherComponent} from "../weather/weather.component";

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [
    NgIf,
    WeatherComponent
  ],
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent {
  @Input() public graph: Graph | null = null;
  @Input() public visible: boolean = false; // Added this line

  constructor(private sanitizer: DomSanitizer) { }

  public getSafeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
