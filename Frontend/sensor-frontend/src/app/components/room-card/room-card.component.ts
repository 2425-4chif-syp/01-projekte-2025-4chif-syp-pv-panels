import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoomData } from '../../models/room-data';
import { ThresholdService } from '../../services/threshold.service';

@Component({
  selector: 'app-room-card',
  templateUrl: './room-card.component.html',
  styleUrls: ['./room-card.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class RoomCardComponent {
  @Input() room!: RoomData;
  @Input() displayMode: 'temperature' | 'humidity' | 'co2' = 'temperature';

  constructor(private thresholdService: ThresholdService) {}

  getValue(): string {
    switch (this.displayMode) {
      case 'temperature':
        return this.getTemperature();
      case 'humidity':
        return this.getHumidity();
      case 'co2':
        return this.getCO2();
      default:
        return '--';
    }
  }

  getStatus(): string {
    switch (this.displayMode) {
      case 'temperature':
        return this.getTemperatureStatus(this.room.sensors?.temperature);
      case 'humidity':
        return this.getHumidityStatus(this.room.sensors?.humidity);
      case 'co2':
        return this.getCO2Status(this.room.sensors?.co2);
      default:
        return 'neutral';
    }
  }

  getTemperature(): string {
    return this.room.sensors?.temperature !== undefined 
      ? this.room.sensors.temperature.toFixed(1) + '°C'
      : '--';
  }

  getHumidity(): string {
    return this.room.sensors?.humidity !== undefined
      ? this.room.sensors.humidity.toFixed(1) + '%'
      : '--';
  }

  getCO2(): string {
    return this.room.sensors?.co2 !== undefined
      ? this.room.sensors.co2.toFixed(0) + ' ppm'
      : '--';
  }

  getTemperatureStatus(temp: number | undefined): string {
    return this.thresholdService.getTemperatureStatus(temp);
  }

  getHumidityStatus(humidity: number | undefined): string {
    return this.thresholdService.getHumidityStatus(humidity);
  }

  getCO2Status(co2: number | undefined): string {
    return this.thresholdService.getCO2Status(co2);
  }

  formatRoomName(name: string): string {
    return name.replace('Raum ', '');
  }
}
