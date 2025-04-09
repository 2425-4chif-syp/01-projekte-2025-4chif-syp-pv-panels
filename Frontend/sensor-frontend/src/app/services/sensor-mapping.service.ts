import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { SensorMapping, SensorRoomMapping } from '../models/sensor-mapping.interface';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SensorMappingService {
  
  // Der lokale Speicher-Key für die Mappings
  private readonly STORAGE_KEY = 'sensor-room-mappings';
  
  // BehaviorSubject, um Änderungen an Mappings zu überwachen
  private mappingsSubject = new BehaviorSubject<SensorRoomMapping[]>(this.loadMappingsFromStorage());

  constructor() {}

  // Lädt die Mappings aus dem lokalen Speicher
  private loadMappingsFromStorage(): SensorRoomMapping[] {
    const mappingsJson = localStorage.getItem(this.STORAGE_KEY);
    if (mappingsJson) {
      try {
        return JSON.parse(mappingsJson);
      } catch (error) {
        console.error('Fehler beim Laden der Sensor-Mappings:', error);
        return [];
      }
    }
    return [];
  }

  // Speichert Mappings im lokalen Speicher
  private saveMappingsToStorage(mappings: SensorRoomMapping[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mappings));
  }

  // Gibt alle Mappings als Observable zurück
  getMappings(): Observable<SensorRoomMapping[]> {
    return this.mappingsSubject.asObservable();
  }

  // Fügt ein neues Mapping hinzu oder aktualisiert ein bestehendes
  addOrUpdateMapping(mapping: SensorRoomMapping): void {
    const mappings = this.mappingsSubject.value;
    
    // Prüfen, ob ein Mapping für diesen Sensor bereits existiert
    const existingIndex = mappings.findIndex(m => 
      m.sensorId === mapping.sensorId && m.floor === mapping.floor
    );
    
    if (existingIndex >= 0) {
      // Bestehendes Mapping aktualisieren
      mappings[existingIndex] = mapping;
    } else {
      // Neues Mapping hinzufügen
      mappings.push(mapping);
    }
    
    // Speichern und den Subject aktualisieren
    this.saveMappingsToStorage(mappings);
    this.mappingsSubject.next([...mappings]);
  }

  // Entfernt ein Mapping
  removeMapping(sensorId: string, floor: string): void {
    let mappings = this.mappingsSubject.value;
    
    mappings = mappings.filter(m => !(m.sensorId === sensorId && m.floor === floor));
    
    this.saveMappingsToStorage(mappings);
    this.mappingsSubject.next([...mappings]);
  }

  // Findet ein Raumzuordnung für einen Sensor
  findRoomForSensor(sensorId: string, floor: string): number | null {
    const mapping = this.mappingsSubject.value.find(
      m => m.sensorId === sensorId && m.floor === floor
    );
    
    return mapping ? mapping.roomId : null;
  }

  // Findet alle Sensoren für einen Raum
  findSensorsForRoom(roomId: number): SensorRoomMapping[] {
    return this.mappingsSubject.value.filter(m => m.roomId === roomId);
  }
}