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
import { MatIconModule } from '@angular/material/icon';
import { SensorMappingComponent } from '../sensor-mapping/sensor-mapping.component';
import { forkJoin, interval, of, Subscription } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

// Interface für Sensor mit zusätzlichen Eigenschaften für die UI
interface SensorUIItem {
  sensorId: string;
  floor: string;
  mappedRoomName?: string;
  mappedRoomId?: number;
}

@Component({
  selector: 'app-building',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatCardModule, 
    MatButtonModule, 
    MatButtonToggleModule,
    MatDialogModule,
    MatIconModule,
    DragDropModule
  ],
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.scss']
})
export class BuildingComponent implements OnInit, OnDestroy {
  secondFloorRooms: Room[] = [];
  firstFloorRooms: Room[] = [];
  groundFloorRooms: Room[] = [];
  basementRooms: Room[] = [];
  unassignedSensors: SensorUIItem[] = []; // Neue Liste für nicht zugewiesene Sensoren
  selectedSensorType: string = 'temperature'; // Default selected type
  private autoSwitchInterval: any;
  private sensorTypes = ['temperature', 'humidity', 'co2'];
  private mappingsSubscription: Subscription | null = null;
  private dataRefreshSubscription: Subscription | null = null; // Neue Subscription für Daten-Aktualisierung
  showSidebar: boolean = true; // Standardmäßig die Seitenleiste anzeigen
  isLoading: boolean = false; // Flag für Ladestatus

  constructor(
    private roomService: RoomService,
    private sensorService: SensorService,
    private sensorMappingService: SensorMappingService,
    private dialog: MatDialog
  ) {
    this.startAutoSwitch();
  }

  ngOnInit() {
    this.initializeData();
    this.setupDataRefresh();
  }

  // Neue Methode für die Initialisierung der Daten
  private initializeData(): void {
    this.roomService.getAllRooms().subscribe(rooms => {
      this.sortRooms(rooms);
      this.loadSensorData();
      this.loadUnassignedSensors(); // Nicht zugewiesene Sensoren laden
      
      // Abonniere Änderungen an den Sensor-Mappings
      this.mappingsSubscription = this.sensorMappingService.getMappings().subscribe(() => {
        // Bei Änderungen die Sensor-Daten neu laden
        this.loadSensorData();
        this.loadUnassignedSensors(); // Auch die nicht zugewiesenen Sensoren aktualisieren
      });
    });
  }

  // Neue Methode für regelmäßige Datenaktualisierung
  private setupDataRefresh(): void {
    // Alle 30 Sekunden die Sensordaten aktualisieren
    this.dataRefreshSubscription = interval(30000).subscribe(() => {
      console.log('Refreshing sensor data automatically');
      this.loadSensorData();
      // Optional auch die unassigned sensors aktualisieren
      // this.loadUnassignedSensors(); 
    });
  }

  ngOnDestroy() {
    this.stopAutoSwitch();
    if (this.mappingsSubscription) {
      this.mappingsSubscription.unsubscribe();
    }
    // Auch die Daten-Aktualisierungs-Subscription aufräumen
    if (this.dataRefreshSubscription) {
      this.dataRefreshSubscription.unsubscribe();
    }
  }

  // Lädt alle Sensoren, die noch keinem Raum zugewiesen wurden
  loadUnassignedSensors(): void {
    this.unassignedSensors = [];
    
    // Für jedes Stockwerk die Sensoren laden
    this.sensorService.getAllFloors().subscribe(floors => {
      floors.forEach(floor => {
        this.sensorService.getSensorsByFloor(floor).subscribe(sensorIds => {
          // Für jeden Sensor prüfen, ob er bereits einem Raum zugeordnet ist
          sensorIds.forEach(sensorId => {
            const roomId = this.sensorMappingService.findRoomForSensor(sensorId, floor);
            
            // Wenn der Sensor keinem Raum zugeordnet ist, zur Liste hinzufügen
            if (!roomId) {
              // Prüfen, ob der Sensor bereits in der Liste ist
              const existingSensor = this.unassignedSensors.find(
                s => s.sensorId === sensorId && s.floor === floor
              );
              
              // Nur hinzufügen, wenn er noch nicht in der Liste ist
              if (!existingSensor) {
                this.unassignedSensors.push({
                  sensorId: sensorId,
                  floor: floor
                });
              }
            }
          });
        });
      });
    });
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
      this.loadUnassignedSensors(); // Auch die nicht zugewiesenen Sensoren aktualisieren
    });
  }

  // Neue Methode für Drag-and-Drop eines Sensors auf einen Raum
  onSensorDrop(event: CdkDragDrop<any>): void {
    // Prüfen, ob der Drop auf eine Raum-Box stattgefunden hat
    if (event.container.data && typeof event.container.data === 'object' && 'roomId' in event.container.data) {
      // ID und Stockwerk des gezogenen Sensors aus den Attributen abrufen
      const sensorElement = event.item.element.nativeElement;
      const sensorId = sensorElement.getAttribute('data-sensor-id');
      const floor = sensorElement.getAttribute('data-floor');
      const roomId = (event.container.data as Room).roomId;
      
      if (sensorId && floor && roomId) {
        // Mapping erstellen und hinzufügen
        const mapping: SensorRoomMapping = {
          sensorId: sensorId,
          floor: floor,
          roomId: roomId
        };
        
        this.sensorMappingService.addOrUpdateMapping(mapping);
        
        // Sensor aus der unassignedSensors-Liste entfernen
        this.unassignedSensors = this.unassignedSensors.filter(
          s => !(s.sensorId === sensorId && s.floor === floor)
        );
        
        // Sensordaten neu laden
        this.loadSensorData();
      }
    }
  }
  
  // Hilfsmethode, um festzustellen, ob ein Raum zugewiesene Sensoren hat
  getRoomSensors(room: Room): { sensorId: string, floor: string }[] {
    const mappings = this.sensorMappingService.findSensorsForRoom(room.roomId);
    return mappings.map(mapping => ({
      sensorId: mapping.sensorId,
      floor: mapping.floor
    }));
  }

  // Methode zum manuellen Aktualisieren der Daten
  refreshData(): void {
    this.isLoading = true;
    this.loadSensorData();
    // Nach einer kurzen Verzögerung den Ladeindikator zurücksetzen
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  // Methode zum Umschalten der Seitenleisten-Anzeige
  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
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

  // Entfernt einen Sensor aus einem Raum und fügt ihn wieder in die Liste der nicht zugewiesenen Sensoren ein
  removeSensorFromRoom(room: Room, sensorId: string, floor: string): void {
    // Zuerst die Zuordnung im Service entfernen
    this.sensorMappingService.removeMapping(sensorId, floor);
    
    // Prüfen, ob der Sensor bereits in der Liste der nicht zugewiesenen Sensoren ist
    const existingSensor = this.unassignedSensors.find(
      s => s.sensorId === sensorId && s.floor === floor
    );
    
    // Nur hinzufügen, wenn er noch nicht in der Liste ist
    if (!existingSensor) {
      this.unassignedSensors.push({
        sensorId: sensorId,
        floor: floor
      });
    }
    
    // Sensordaten direkt aus dem Raum entfernen
    this.clearRoomSensorData(room);
    
    // Sensordaten neu laden
    this.loadSensorData();
  }
  
  // Hilfsmethode zum Löschen von Sensordaten eines Raums
  private clearRoomSensorData(room: Room): void {
    // Sensor-Daten aus dem Raum entfernen
    if (room.sensor) {
      room.sensor = undefined;
    }
  }
}
