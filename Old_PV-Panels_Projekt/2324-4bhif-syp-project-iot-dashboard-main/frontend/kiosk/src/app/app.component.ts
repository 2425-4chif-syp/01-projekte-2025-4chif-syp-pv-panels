import {Component, NgModule} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {GraphOverviewComponent} from "./graph-overview/graph-overview.component";
import {HttpClientModule} from "@angular/common/http";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {WeatherComponent} from "./weather/weather.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GraphOverviewComponent, HttpClientModule, MatSlideToggleModule, WeatherComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'kiosk';
}
