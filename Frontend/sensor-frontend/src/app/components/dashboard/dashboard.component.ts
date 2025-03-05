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
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RoomCardComponent,
    ThresholdModalComponent
  ]
})
export class DashboardComponent implements OnInit {
  allRooms: RoomData[] = [];
  
  @ViewChild(ThresholdModalComponent) thresholdModal!: ThresholdModalComponent;

  constructor(private sensorDataService: SensorDataService) {}

  ngOnInit(): void {
    this.sensorDataService.getRooms().subscribe(rooms => {
      this.allRooms = rooms;
    });
  }
  
  openThresholdSettings(): void {
    if (this.thresholdModal) {
      this.thresholdModal.open();
    }
  }
}
