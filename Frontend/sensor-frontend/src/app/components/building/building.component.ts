import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { SensorService } from '../../services/sensor.service';
import { Room } from '../../models/room.interface';
import { SensorValue } from '../../models/sensor.interface';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-building',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatButtonToggleModule],
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.scss']
})
export class BuildingComponent implements OnInit, OnDestroy {
  secondFloorRooms: Room[] = [];
  firstFloorRooms: Room[] = [];
  groundFloorRooms: Room[] = [];
  basementRooms: Room[] = [];
  selectedSensorType: string = 'temperature'; // Default selected type
  private autoSwitchInterval: any;
  private sensorTypes = ['temperature', 'humidity', 'co2'];

  constructor(
    private roomService: RoomService,
    private sensorService: SensorService
  ) {
    this.startAutoSwitch();
  }

  ngOnInit() {
    this.roomService.getAllRooms().subscribe(rooms => {
      this.sortRooms(rooms);
      this.loadSensorData();
    });
  }

  ngOnDestroy() {
    this.stopAutoSwitch();
  }

  private normalizeSensorType(type: string): string {
    type = type.toLowerCase();
    switch (type) {
      case 'temp':
      case 'temperature':
        return 'temperature';
      case 'co2':
        return 'co2';
      case 'hum':
      case 'humidity':
        return 'humidity';
      default:
        return type;
    }
  }

  private loadSensorData() {
    const loadSensorDataForRooms = (rooms: Room[], floor: string) => {
      rooms.forEach(room => {
        const roomNumber = room.roomName.replace(/[^0-9]/g, '');
        if (roomNumber) {
          this.sensorService.getSensorsByFloor(floor).pipe(
            catchError(error => {
              console.error(`Error fetching sensors for floor ${floor}:`, error);
              return of([]);
            }),
            switchMap(sensors => {
              const matchingSensor = sensors.find(sensor => sensor.includes(roomNumber));
              if (matchingSensor) {
                return forkJoin({
                  types: this.sensorService.getSensorFields(floor, matchingSensor),
                  values: this.sensorService.getAllSensorValues(floor, matchingSensor)
                }).pipe(
                  catchError(error => {
                    console.error(`Error fetching sensor data for ${matchingSensor}:`, error);
                    return of({ types: [], values: [] });
                  })
                );
              }
              return of({ types: [], values: [] });
            })
          ).subscribe(({ types, values }) => {
            if (types.length > 0) {
              const latestValues: { [key: string]: SensorValue } = {};
              
              values.forEach(value => {
                const normalizedType = this.normalizeSensorType(value.sensorType);
                const currentValue = latestValues[normalizedType];
                const newTimestamp = new Date(value.timestamp);
                
                if (!currentValue || newTimestamp > new Date(currentValue.timestamp)) {
                  latestValues[normalizedType] = {
                    timestamp: value.timestamp,
                    value: value.value
                  };
                }
              });
              
              const normalizedTypes = types.map(type => this.normalizeSensorType(type));
              
              if (room.sensor === undefined) {
                room.sensor = {
                  sensorId: roomNumber,
                  sensorTypes: normalizedTypes,
                  latestValues: latestValues
                };
              } else {
                room.sensor.sensorTypes = normalizedTypes;
                room.sensor.latestValues = latestValues;
              }
            }
          });
        }
      });
    };

    loadSensorDataForRooms(this.basementRooms, 'ug');
    loadSensorDataForRooms(this.groundFloorRooms, 'eg');
    loadSensorDataForRooms(this.firstFloorRooms, '1og');
    loadSensorDataForRooms(this.secondFloorRooms, '2og');
  }

  private sortRooms(rooms: Room[]) {
    for (const room of rooms) {
      if (room.roomName.startsWith('U')) {
        this.basementRooms.push(room);
      } else if (room.roomName.startsWith('E')) {
        this.groundFloorRooms.push(room);
      } else {
        const roomNum = parseInt(room.roomName);
        if (!isNaN(roomNum)) {
          if (roomNum >= 200 && roomNum < 300) {
            this.secondFloorRooms.push(room);
          } else if (roomNum >= 100 && roomNum < 200) {
            this.firstFloorRooms.push(room);
          }
        }
      }
    }

    // Sort rooms by room number within each floor
    this.secondFloorRooms.sort((a, b) => a.roomName.localeCompare(b.roomName));
    this.firstFloorRooms.sort((a, b) => a.roomName.localeCompare(b.roomName));
    this.groundFloorRooms.sort((a, b) => a.roomName.localeCompare(b.roomName));
    this.basementRooms.sort((a, b) => a.roomName.localeCompare(b.roomName));
  }

  setSelectedType(type: string) {
    const normalizedType = this.normalizeSensorType(type);
    this.selectedSensorType = normalizedType;
  }

  shouldShowSensorType(type: string): boolean {
    return this.normalizeSensorType(type) === this.selectedSensorType;
  }

  getColorClass(room: Room): string {
    switch (this.selectedSensorType) {
      case 'temperature':
        return this.getTemperatureClass(room.sensor?.latestValues?.['temperature']?.value);
      case 'humidity':
        return this.getHumidityClass(room.sensor?.latestValues?.['humidity']?.value);
      case 'co2':
        return this.getCO2Class(room.sensor?.latestValues?.['co2']?.value);
      default:
        return '';
    }
  }

  private getTemperatureClass(temp: number | undefined): string {
    if (temp === undefined) return '';
    if (temp >= 20 && temp <= 25) {
      return 'temp-optimal';
    } else if ((temp >= 15 && temp < 20) || (temp > 25 && temp <= 30)) {
      return 'temp-warning';
    } else {
      return 'temp-danger';
    }
  }

  private getHumidityClass(humidity: number | undefined): string {
    if (humidity === undefined) return '';
    if (humidity >= 30 && humidity <= 60) {
      return 'humidity-optimal';
    } else if ((humidity >= 20 && humidity < 30) || (humidity > 60 && humidity <= 70)) {
      return 'humidity-warning';
    } else {
      return 'humidity-danger';
    }
  }

  private getCO2Class(co2: number | undefined): string {
    if (co2 === undefined) return '';
    if (co2 >= 0 && co2 <= 1000) {
      return 'co2-optimal';
    } else if (co2 > 1000 && co2 <= 2000) {
      return 'co2-warning';
    } else {
      return 'co2-danger';
    }
  }

  private startAutoSwitch() {
    this.autoSwitchInterval = setInterval(() => {
      const currentIndex = this.sensorTypes.indexOf(this.selectedSensorType);
      const nextIndex = (currentIndex + 1) % this.sensorTypes.length;
      this.setSelectedType(this.sensorTypes[nextIndex]);
    }, 15000); // Switch every 15 seconds
  }

  private stopAutoSwitch() {
    if (this.autoSwitchInterval) {
      clearInterval(this.autoSwitchInterval);
    }
  }
}
