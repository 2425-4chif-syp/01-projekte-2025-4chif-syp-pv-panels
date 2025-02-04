import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { RoomData } from '../models/room-data';
import { SensorData } from '../models/sensor-data';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class SensorDataService {
  private rooms: Map<string, RoomData> = new Map();
  private roomsSubject = new BehaviorSubject<RoomData[]>([]);

  // Mapping für Sensortypen
  private sensorTypeMap: { [key: string]: string } = {
    'TEMP': 'temperature',
    'temperature': 'temperature',
    'HUM': 'humidity',
    'humidity': 'humidity',
    'CO2': 'co2',
    'co2': 'co2'
  };

  constructor(private websocketService: WebsocketService) {
    // Initialize rooms
    this.initializeRooms();
    
    // Subscribe to WebSocket messages
    this.websocketService.getMessages().subscribe(
      (data: SensorData) => {
        console.log('Received sensor data:', data);
        this.updateSensorData(data);
      },
      error => console.error('Error in WebSocket subscription:', error)
    );
  }

  private initializeRooms(): void {
    // Erdgeschoss - exactly as in MQTT topic
    this.addRoom({ id: 'e72', name: 'Raum EG72', floor: 'eg', sensors: {} });

    // Untergeschoss - exactly as in MQTT topic
    this.addRoom({ id: 'U90', name: 'Raum UG90', floor: 'ug', sensors: {} });
    this.addRoom({ id: 'U86', name: 'Raum UG86', floor: 'ug', sensors: {} });
    this.addRoom({ id: 'U82', name: 'Raum UG82', floor: 'ug', sensors: {} });
    this.addRoom({ id: 'U82_', name: 'Raum UG82_', floor: 'ug', sensors: {} });
    this.addRoom({ id: 'U08', name: 'Raum UG08', floor: 'ug', sensors: {} });
  }

  private addRoom(room: RoomData): void {
    this.rooms.set(room.id, room);
    this.emitRooms();
  }

  private updateSensorData(data: SensorData): void {
    console.log('Processing sensor data:', data);
    const parts = data.topic.split('/');
    if (parts.length !== 3) {
      console.warn('Invalid topic format:', data.topic);
      return;
    }

    const [floor, room, sensorType] = parts;
    // Use room ID exactly as it comes in the MQTT topic
    const roomId = room;
    
    console.log('Looking for room:', roomId);
    const roomData = this.rooms.get(roomId);
    
    if (roomData) {
      // Standardize sensor type using the mapping
      const standardSensorType = this.sensorTypeMap[sensorType] || sensorType.toLowerCase();
      console.log('Updating room:', roomId, 'with sensor type:', standardSensorType, 'value:', data.message.value);
      
      roomData.sensors = {
        ...roomData.sensors,
        [standardSensorType]: data.message.value
      };
      this.emitRooms();
    } else {
      console.warn('Room not found:', roomId);
    }
  }

  private emitRooms(): void {
    const roomsArray = Array.from(this.rooms.values());
    console.log('Emitting updated rooms:', roomsArray);
    this.roomsSubject.next(roomsArray);
  }

  public getRooms(): Observable<RoomData[]> {
    return this.roomsSubject.asObservable();
  }

  public getRoomById(id: string): RoomData | undefined {
    return this.rooms.get(id);
  }
}
