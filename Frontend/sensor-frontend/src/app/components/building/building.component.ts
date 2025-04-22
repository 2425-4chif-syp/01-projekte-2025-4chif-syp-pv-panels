import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { SensorService } from '../../services/sensor.service';
import { SensorMappingService } from '../../services/sensor-mapping.service';
import { Room } from '../../models/room.interface';
import { SensorValue } from '../../models/sensor.interface';
import { SensorRoomMapping } from '../../models/sensor-mapping.interface';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SensorMappingComponent } from '../sensor-mapping/sensor-mapping.component';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-building',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatCardModule, 
    MatButtonModule, 
    MatButtonToggleModule,
    MatDialogModule
  ],
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
  private mappingsSubscription: Subscription | null = null;

  constructor(
    private roomService: RoomService,
    private sensorService: SensorService,
    private sensorMappingService: SensorMappingService,
    private dialog: MatDialog
  ) {
    this.startAutoSwitch();
  }

  ngOnInit() {
    this.roomService.getAllRooms().subscribe(rooms => {
      this.sortRooms(rooms);
      this.loadSensorData();
      
      // Abonniere Änderungen an den Sensor-Mappings
      this.mappingsSubscription = this.sensorMappingService.getMappings().subscribe(() => {
        // Bei Änderungen die Sensor-Daten neu laden
        this.loadSensorData();
      });
    });
  }

  ngOnDestroy() {
    this.stopAutoSwitch();
    if (this.mappingsSubscription) {
      this.mappingsSubscription.unsubscribe();
    }
  }

  // Öffnet den Dialog zur Sensor-Raum-Zuweisung
  openSensorMappingDialog(): void {
    const dialogRef = this.dialog.open(SensorMappingComponent, {
      width: '90%',        // Erhöhte Breite auf 90% des Fensters
      height: '90%',       // Erhöhte Höhe auf 90% des Fensters
      maxWidth: '800px',  // Maximale Breite festlegen
      maxHeight: '695px',  // Maximale Höhe festlegen
      panelClass: 'sensor-mapping-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      // Wenn Änderungen vorgenommen wurden, Daten neu laden
      this.loadSensorData();
    });
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
        // Nur noch zugewiesene Sensoren für den Raum laden
        // Die automatische Zuweisung nach Raumnummer ist entfernt worden
        this.loadMappedSensors(room);
      });
    };

    loadSensorDataForRooms(this.basementRooms, 'ug');
    loadSensorDataForRooms(this.groundFloorRooms, 'eg');
    loadSensorDataForRooms(this.firstFloorRooms, '1og');
    loadSensorDataForRooms(this.secondFloorRooms, '2og');
  }

  // Diese Methode wird nicht mehr genutzt, da wir nur noch explizit zugewiesene Sensoren verwenden
  private loadRegularSensors(room: Room, floor: string): void {
    // Diese Funktion ist bewusst leer gelassen, da wir keine automatische Zuweisung mehr wollen
  }

  // Lädt Sensoren, die dem Raum zugeordnet wurden (über das Mapping)
  private loadMappedSensors(room: Room): void {
    // Alle Sensoren finden, die diesem Raum zugewiesen sind
    const mappedSensors = this.sensorMappingService.findSensorsForRoom(room.roomId);
    
    mappedSensors.forEach(mapping => {
      // Für jeden zugewiesenen Sensor die Daten laden
      this.sensorService.getSensorFields(mapping.floor, mapping.sensorId).pipe(
        catchError(error => {
          console.error(`Error fetching sensors for mapped sensor ${mapping.sensorId}:`, error);
          return of([]);
        }),
        switchMap(types => {
          if (types.length > 0) {
            return forkJoin({
              types: of(types),
              values: this.sensorService.getAllSensorValues(mapping.floor, mapping.sensorId)
            }).pipe(
              catchError(error => {
                console.error(`Error fetching sensor data for ${mapping.sensorId}:`, error);
                return of({ types: [], values: [] });
              })
            );
          }
          return of({ types: [], values: [] });
        })
      ).subscribe(({ types, values }) => {
        if (types.length > 0) {
          this.updateRoomSensorData(room, types, values);
        }
      });
    });
  }

  // Aktualisiert die Sensordaten für einen Raum
  private updateRoomSensorData(room: Room, types: string[], values: any[]): void {
    const latestValues: { [key: string]: SensorValue } = room.sensor?.latestValues || {};
    
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
    const existingSensorTypes = room.sensor?.sensorTypes || [];
    
    // Alle eindeutigen Sensortypen zusammenführen
    const allSensorTypes = Array.from(new Set([...existingSensorTypes, ...normalizedTypes]));
    
    if (room.sensor === undefined) {
      room.sensor = {
        sensorId: room.roomName,  // Als ID verwenden wir jetzt den Raumnamen
        sensorTypes: allSensorTypes,
        latestValues: latestValues
      };
    } else {
      room.sensor.sensorTypes = allSensorTypes;
      room.sensor.latestValues = {...room.sensor.latestValues, ...latestValues};
    }
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
