import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { SensorData, SensorValue } from '../models/sensor.interface';

@Injectable({
  providedIn: 'root'
})
export class SensorService {
  private apiUrl = 'http://localhost:8081/sensors';

  constructor(private http: HttpClient) { }

  getSensorsByFloor(floor: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${floor}`);
  }

  getSensorFields(floor: string, sensorId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${floor}/${sensorId}`);
  }

  getSpecificSensorValues(floor: string, sensorId: string, sensorType: string): Observable<SensorValue[]> {
    return this.http.get<SensorValue[]>(`${this.apiUrl}/${floor}/${sensorId}/${sensorType}`);
  }

  getAllSensorValues(floor: string, sensorId: string): Observable<SensorData[]> {
    return this.http.get<SensorData[]>(`${this.apiUrl}/${floor}/${sensorId}/values`);
  }
}