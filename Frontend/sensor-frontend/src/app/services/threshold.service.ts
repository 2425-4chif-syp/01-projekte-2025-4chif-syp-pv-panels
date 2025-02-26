import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ThresholdValues {
  temperature: {
    criticalLow: number;
    acceptableLow: number;
    acceptableHigh: number;
    criticalHigh: number;
  };
  humidity: {
    criticalLow: number;
    acceptableLow: number;
    acceptableHigh: number;
    criticalHigh: number;
  };
  co2: {
    acceptable: number;
    critical: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ThresholdService {
  private readonly STORAGE_KEY = 'sensor-thresholds';
  private readonly DEFAULT_THRESHOLDS: ThresholdValues = {
    temperature: {
      criticalLow: 15,
      acceptableLow: 18,
      acceptableHigh: 25,
      criticalHigh: 28
    },
    humidity: {
      criticalLow: 30,
      acceptableLow: 40,
      acceptableHigh: 60,
      criticalHigh: 70
    },
    co2: {
      acceptable: 1000,
      critical: 1400
    }
  };

  private thresholdsSubject = new BehaviorSubject<ThresholdValues>(this.loadThresholds());

  constructor() {
    // Ensure thresholds are loaded from localStorage or defaults are set
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.saveThresholds(this.DEFAULT_THRESHOLDS);
    }
  }

  get thresholds$(): Observable<ThresholdValues> {
    return this.thresholdsSubject.asObservable();
  }

  get currentThresholds(): ThresholdValues {
    return this.thresholdsSubject.value;
  }

  updateThresholds(newThresholds: ThresholdValues): void {
    this.saveThresholds(newThresholds);
    this.thresholdsSubject.next(newThresholds);
  }

  resetToDefaults(): void {
    this.saveThresholds(this.DEFAULT_THRESHOLDS);
    this.thresholdsSubject.next(this.DEFAULT_THRESHOLDS);
  }

  private loadThresholds(): ThresholdValues {
    const storedThresholds = localStorage.getItem(this.STORAGE_KEY);
    return storedThresholds ? JSON.parse(storedThresholds) : this.DEFAULT_THRESHOLDS;
  }

  private saveThresholds(thresholds: ThresholdValues): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(thresholds));
  }

  getTemperatureStatus(temp: number | undefined): string {
    if (!temp) return 'critical';
    const { criticalLow, acceptableLow, acceptableHigh, criticalHigh } = this.currentThresholds.temperature;
    
    if (temp < criticalLow || temp > criticalHigh) return 'critical';
    if (temp < acceptableLow || temp > acceptableHigh) return 'acceptable';
    return 'comfortable';
  }

  getHumidityStatus(humidity: number | undefined): string {
    if (!humidity) return 'critical';
    const { criticalLow, acceptableLow, acceptableHigh, criticalHigh } = this.currentThresholds.humidity;
    
    if (humidity < criticalLow || humidity > criticalHigh) return 'critical';
    if (humidity < acceptableLow || humidity > acceptableHigh) return 'acceptable';
    return 'comfortable';
  }

  getCO2Status(co2: number | undefined): string {
    if (!co2) return 'critical';
    const { acceptable, critical } = this.currentThresholds.co2;
    
    if (co2 > critical) return 'critical';
    if (co2 > acceptable) return 'acceptable';
    return 'comfortable';
  }
}