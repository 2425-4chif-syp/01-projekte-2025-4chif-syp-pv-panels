import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-grafana-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="grafana-dashboard">
      <header>
        <button class="back-button" routerLink="/">← Zurück zur Übersicht</button>
        <h2>Grafana Dashboard</h2>
      </header>
      <div class="dashboard-container">
        <iframe [src]="dashboardUrl" frameborder="0" width="100%" height="100%"></iframe>
      </div>
    </div>
  `,
  styles: [`
    .grafana-dashboard {
      min-height: 100vh;
      background-color: #fff;
      padding: 20px;
    }

    header {
      background-color: #FF8B7C;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 24px;
      color: white;
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
      gap: 20px;
    }

    .back-button {
      background: none;
      border: none;
      color: white;
      font-size: 1rem;
      cursor: pointer;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .back-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    h2 {
      margin: 0;
      font-size: 2rem;
      text-align: center;
    }

    .dashboard-container {
      height: calc(100vh - 150px);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    iframe {
      border: none;
    }
  `]
})
export class GrafanaDashboardComponent {
  dashboardUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.dashboardUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'http://localhost:3000/d/cec5j4z2kh534c/weather-week-januar?orgId=1&from=2024-12-31T23:00:00.000Z&to=2025-02-07T10:35:55.392Z&timezone=browser&viewPanel=panel-1&kiosk=true'
    );
  }
} 