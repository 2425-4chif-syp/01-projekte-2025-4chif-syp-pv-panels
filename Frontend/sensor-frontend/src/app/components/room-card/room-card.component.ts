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
}
