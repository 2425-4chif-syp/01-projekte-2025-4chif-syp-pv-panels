import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoomData } from '../../models/room-data';

@Component({
  selector: 'app-room-card',
  templateUrl: './room-card.component.html',
  styleUrls: ['./room-card.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class RoomCardComponent {
  @Input() room!: RoomData;

  getTemperature(): string {
    return this.room.sensors.temperature !== undefined 
      ? this.room.sensors.temperature.toFixed(1) + '°C'
      : '--';
  }

  getHumidity(): string {
    return this.room.sensors.humidity !== undefined
      ? this.room.sensors.humidity.toFixed(1) + '%'
      : '--';
  }

  getCO2(): string {
    return this.room.sensors.co2 !== undefined
      ? this.room.sensors.co2.toFixed(0) + ' ppm'
      : '--';
  }

  getTemperatureStatus(temp: number | undefined): string {
    if (!temp) return 'critical';
    if (temp < 15 || temp > 28) return 'critical';
    if (temp < 18 || temp > 25) return 'acceptable';
    return 'comfortable';
  }

  getHumidityStatus(humidity: number | undefined): string {
    if (!humidity) return 'critical';
    if (humidity < 30 || humidity > 70) return 'critical';
    if (humidity < 40 || humidity > 60) return 'acceptable';
    return 'comfortable';
  }

  getCO2Status(co2: number | undefined): string {
    if (!co2) return 'critical';
    if (co2 > 1400) return 'critical';
    if (co2 > 1000) return 'acceptable';
    return 'comfortable';
  }

  formatRoomName(name: string): string {
    return name.replace('Raum ', '');
  }
}
