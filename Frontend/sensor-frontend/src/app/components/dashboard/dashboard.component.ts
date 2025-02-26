import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoomData } from '../../models/room-data';
import { SensorDataService } from '../../services/sensor-data.service';
import { RoomCardComponent } from '../room-card/room-card.component';
import { ThresholdModalComponent } from '../threshold-modal/threshold-modal.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, RoomCardComponent, RouterModule, ThresholdModalComponent],
  standalone: true
})
export class DashboardComponent implements OnInit {
  egRooms: RoomData[] = [];
  ugRooms: RoomData[] = [];
  
  @ViewChild(ThresholdModalComponent) thresholdModal!: ThresholdModalComponent;

  constructor(private sensorDataService: SensorDataService) {}

  ngOnInit(): void {
    this.sensorDataService.getRooms().subscribe(rooms => {
      this.egRooms = rooms.filter(room => room.floor === 'eg');
      this.ugRooms = rooms.filter(room => room.floor === 'ug');
    });
  }
  
  openThresholdSettings(): void {
    if (this.thresholdModal) {
      this.thresholdModal.open();
    }
  }
}
