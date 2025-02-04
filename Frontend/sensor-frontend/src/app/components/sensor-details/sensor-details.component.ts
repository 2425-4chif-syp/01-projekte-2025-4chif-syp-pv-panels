import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SensorDataService } from '../../services/sensor-data.service';
import { RoomData } from '../../models/room-data';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sensor-details',
  templateUrl: './sensor-details.component.html',
  styleUrls: ['./sensor-details.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class SensorDetailsComponent implements OnInit, OnDestroy {
  roomId: string = '';
  room?: RoomData;
  private subscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private sensorDataService: SensorDataService
  ) {}

  ngOnInit(): void {
    // Get location from query params
    this.route.queryParams.subscribe(params => {
      this.roomId = params['location'] || '';
      this.loadRoomData();
    });
  }

  private loadRoomData(): void {
    if (this.roomId) {
      this.subscription = this.sensorDataService.getRooms().subscribe(rooms => {
        this.room = rooms.find(room => room.id === this.roomId);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getTemperature(): number {
    return this.room?.sensors?.temperature || 0;
  }

  getHumidity(): number {
    return this.room?.sensors?.humidity || 0;
  }

  getCO2(): number {
    return this.room?.sensors?.co2 || 0;
  }

  getRoomName(): string {
    return this.room?.name || 'Unbekannter Raum';
  }
}
