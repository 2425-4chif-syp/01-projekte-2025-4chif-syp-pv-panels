import { Component, OnInit } from '@angular/core';
import { Graph } from "../model/Graph";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { HttpClient} from "@angular/common/http";
import { NgForOf, NgIf } from "@angular/common";
import { GraphComponent } from "../graph/graph.component";
import { FormsModule } from '@angular/forms';
import { Subscription, timer } from 'rxjs';
import { Duration } from '../model/Duration';
import {WeatherComponent} from "../weather/weather.component";

@Component({
  selector: 'app-graph-overview',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    GraphComponent,
    FormsModule,
    WeatherComponent,
  ],
  templateUrl: './graph-overview.component.html',
  styleUrls: ['./graph-overview.component.css']
})
export class GraphOverviewComponent implements OnInit {
  public graphs: Graph[] = [];
  public currentIndex = -1;
  public currentGraph: Graph | null = null;

  public kioskMode: boolean = true;
  public interval: number = 15;
  subscription!: Subscription;

  public durations: Duration[] = [
    new Duration("5m", "5 minutes"),
    new Duration("1h", "1 hour"),
    new Duration("4h", "4 hours"),
    new Duration("1d", "1 day"),
    new Duration("2d", "2 days"),
    new Duration("7d", "1 week"),
    new Duration("30d", "1 month"),
    new Duration("365d", "1 year")
  ];
  public selectedDuration: Duration = this.durations[3];

  public visible: boolean = false;

  constructor(public sanitizer: DomSanitizer, public http: HttpClient) { }

  ngOnInit(): void {
    this.http.get<Graph[]>('assets/data/graph-data.json').subscribe((data) => {
      this.graphs = data;
      console.log(this.graphs.length + " graphs loaded");
      this.currentIndex = 0; // Ändert den Index, um den ersten Graph direkt anzuzeigen
      this.currentGraph = this.graphs[0]; // Setzt den ersten Graph beim Laden
    });

    this.kioskModeChecker();
  }

  public selectAllGraphs(): void {
    this.currentIndex = -1;
    this.currentGraph = null; // Zeigt alle Graphen an, wenn Dashboard ausgewählt ist
  }

  public selectGraph(index: number): void {
    this.setCurrentGraphWithIndex(index);
  }

  public kioskModeChecker() {
    if (this.kioskMode) {
      this.activateKioskMode();
    } else {
      this.deactivateKioskMode();
    }
  }

  public activateKioskMode(): void {
    this.subscription = timer(0, this.interval * 1000).subscribe(() => {
      this.nextGraph();
    });
  }

  public deactivateKioskMode(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public nextGraph(): void {
    this.currentIndex++;

    if (this.currentIndex >= this.graphs.length) {
      this.currentIndex = 0;
    }

    this.setCurrentGraphWithIndex(this.currentIndex);
  }


  public changeDuration(): void {
    const selectedDuration: string = this.selectedDuration.short;
    const durationPattern: RegExp = /from=now-\d+[a-z]/;

    this.graphs.forEach(graph => {
      graph.iFrameLink = graph.iFrameLink.replace(durationPattern, `from=now-${selectedDuration}`);
    });
  }

  public setCurrentGraphWithIndex(index: number): void {
    this.currentIndex = index;
    if (index >= 0 && index < this.graphs.length) {
      this.currentGraph = this.graphs[index];
    } else {
      this.currentGraph = null;
    }
  }

  public getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public toggleCollapse() {
    this.visible = !this.visible;
  }

  public getAllGraphNames(graphs: Graph[], separator: string): string {
    let res: string[] = [];

    graphs.forEach(g => {
      res.push(g.name);
    });

    return res.join(separator);
  }

  public grafanaServers: string[] = ["localhost:3000", "10.191.112.23/grafana"];
  public selectedGrafanaServer: string = this.grafanaServers[0]; // Ändern Sie den Index entsprechend

  public changeGrafanaServer() {
    this.graphs.forEach(graph => {
      this.grafanaServers.forEach(server => {
        graph.iFrameLink = graph.iFrameLink.replace(server, this.selectedGrafanaServer);
      });
    });

    this.graphs.forEach(graph => {
      console.log(graph.iFrameLink);
    });
  }
}
