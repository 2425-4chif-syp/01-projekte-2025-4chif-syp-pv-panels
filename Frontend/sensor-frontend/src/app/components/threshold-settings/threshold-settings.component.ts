import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThresholdService, ThresholdValues } from '../../services/threshold.service';

@Component({
  selector: 'app-threshold-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="threshold-settings-container">
      <h2>Schwellenwerte Einstellungen</h2>
      
      <div class="threshold-group">
        <h3>Temperatur (°C)</h3>
        <div class="settings-grid">
          <div class="threshold-range">
            <span class="range-label red">Kritisch</span>
            <input type="number" [(ngModel)]="thresholds.temperature.criticalLow" step="0.5">
            <span>-</span>
            <input type="number" [(ngModel)]="thresholds.temperature.acceptableLow" step="0.5">
            <span class="range-label orange">Akzeptabel</span>
          </div>
          
          <div class="threshold-range">
            <span class="range-label orange">Akzeptabel</span>
            <input type="number" [(ngModel)]="thresholds.temperature.acceptableHigh" step="0.5">
            <span>-</span>
            <input type="number" [(ngModel)]="thresholds.temperature.criticalHigh" step="0.5">
            <span class="range-label red">Kritisch</span>
          </div>
          
          <div class="threshold-range green">
            <span class="range-label green">Angenehm:</span>
            <span>{{ thresholds.temperature.acceptableLow }} - {{ thresholds.temperature.acceptableHigh }} °C</span>
          </div>
        </div>
      </div>
      
      <div class="threshold-group">
        <h3>Luftfeuchtigkeit (%)</h3>
        <div class="settings-grid">
          <div class="threshold-range">
            <span class="range-label red">Kritisch</span>
            <input type="number" [(ngModel)]="thresholds.humidity.criticalLow" step="1">
            <span>-</span>
            <input type="number" [(ngModel)]="thresholds.humidity.acceptableLow" step="1">
            <span class="range-label orange">Akzeptabel</span>
          </div>
          
          <div class="threshold-range">
            <span class="range-label orange">Akzeptabel</span>
            <input type="number" [(ngModel)]="thresholds.humidity.acceptableHigh" step="1">
            <span>-</span>
            <input type="number" [(ngModel)]="thresholds.humidity.criticalHigh" step="1">
            <span class="range-label red">Kritisch</span>
          </div>
          
          <div class="threshold-range green">
            <span class="range-label green">Angenehm:</span>
            <span>{{ thresholds.humidity.acceptableLow }} - {{ thresholds.humidity.acceptableHigh }} %</span>
          </div>
        </div>
      </div>
      
      <div class="threshold-group">
        <h3>CO2 (ppm)</h3>
        <div class="settings-grid">
          <div class="threshold-range green">
            <span class="range-label green">Angenehm</span>
            <span>0 - {{ thresholds.co2.acceptable }} ppm</span>
          </div>
          
          <div class="threshold-range">
            <span class="range-label orange">Akzeptabel</span>
            <input type="number" [(ngModel)]="thresholds.co2.acceptable" step="50">
            <span>-</span>
            <input type="number" [(ngModel)]="thresholds.co2.critical" step="50">
            <span class="range-label red">Kritisch</span>
          </div>
        </div>
      </div>
      
      <div class="button-group">
        <button class="save-btn" (click)="saveThresholds()">Speichern</button>
        <button class="reset-btn" (click)="resetToDefaults()">Standardwerte</button>
        <button class="cancel-btn" (click)="cancel()">Abbrechen</button>
      </div>
    </div>
  `,
  styles: [`
    .threshold-settings-container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 20px;
      width: 500px;
      max-width: 90vw;
    }
    
    h2 {
      margin-top: 0;
      text-align: center;
      color: #333;
    }
    
    h3 {
      margin-bottom: 10px;
      color: #444;
    }
    
    .threshold-group {
      margin-bottom: 24px;
    }
    
    .settings-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .threshold-range {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    input[type="number"] {
      width: 60px;
      padding: 4px 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    
    .range-label {
      min-width: 80px;
      font-weight: bold;
    }
    
    .red {
      color: #d9534f;
    }
    
    .orange {
      color: #f0ad4e;
    }
    
    .green {
      color: #5cb85c;
    }
    
    .button-group {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
    }
    
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;
    }
    
    .save-btn {
      background-color: #0275d8;
    }
    
    .reset-btn {
      background-color: #f0ad4e;
    }
    
    .cancel-btn {
      background-color: #d9534f;
    }
  `]
})
export class ThresholdSettingsComponent implements OnInit {
  thresholds: ThresholdValues;
  showSettings = false;
  
  constructor(private thresholdService: ThresholdService) {
    this.thresholds = JSON.parse(JSON.stringify(this.thresholdService.currentThresholds));
  }
  
  ngOnInit(): void {
    // Deep clone the current thresholds to avoid direct modification
    this.thresholds = JSON.parse(JSON.stringify(this.thresholdService.currentThresholds));
  }
  
  saveThresholds(): void {
    this.validateThresholds();
    this.thresholdService.updateThresholds(this.thresholds);
    this.closeSettings();
  }
  
  resetToDefaults(): void {
    this.thresholdService.resetToDefaults();
    this.thresholds = JSON.parse(JSON.stringify(this.thresholdService.currentThresholds));
  }
  
  cancel(): void {
    this.closeSettings();
  }
  
  closeSettings(): void {
    const modal = document.getElementById('threshold-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
  
  private validateThresholds(): void {
    // Ensure the values are in the correct order
    const t = this.thresholds.temperature;
    if (t.criticalLow > t.acceptableLow) {
      t.criticalLow = t.acceptableLow - 1;
    }
    if (t.acceptableLow > t.acceptableHigh) {
      t.acceptableLow = t.acceptableHigh - 1;
    }
    if (t.acceptableHigh > t.criticalHigh) {
      t.acceptableHigh = t.criticalHigh - 1;
    }
    
    // Same for humidity
    const h = this.thresholds.humidity;
    if (h.criticalLow > h.acceptableLow) {
      h.criticalLow = h.acceptableLow - 1;
    }
    if (h.acceptableLow > h.acceptableHigh) {
      h.acceptableLow = h.acceptableHigh - 1;
    }
    if (h.acceptableHigh > h.criticalHigh) {
      h.acceptableHigh = h.criticalHigh - 1;
    }
    
    // For CO2
    const c = this.thresholds.co2;
    if (c.acceptable > c.critical) {
      c.acceptable = c.critical - 50;
    }
  }
}