import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomData } from '../../models/room-data';
import { SensorDataService } from '../../services/sensor-data.service';
import { RoomCardComponent } from '../room-card/room-card.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, RoomCardComponent],
  standalone: true
})
export class DashboardComponent implements OnInit {
  egRooms: RoomData[] = [];
  ugRooms: RoomData[] = [];

  constructor(private sensorDataService: SensorDataService) {}

  ngOnInit(): void {
    this.sensorDataService.getRooms().subscribe(rooms => {
      this.egRooms = rooms.filter(room => room.floor === 'eg');
      this.ugRooms = rooms.filter(room => room.floor === 'ug');
    });
  }
}
