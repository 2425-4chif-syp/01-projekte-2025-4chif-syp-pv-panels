import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SensorData } from '../models/sensor-data';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket!: WebSocket;
  private messageSubject = new Subject<SensorData>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.connect();
  }

  private connect(): void {
    try {
      this.socket = new WebSocket('ws://localhost:8080/mqtt-ws');

      this.socket.onopen = () => {
        console.log('WebSocket connected successfully');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          console.log('Raw WebSocket message:', event.data);
          const data = JSON.parse(event.data);
          console.log('Parsed WebSocket message:', data);
          
          if (data.type === 'connection') {
            console.log('Connection status:', data.status);
            return;
          }

          // Validate message structure
          if (!data.topic || !data.message || typeof data.message.value === 'undefined') {
            console.warn('Invalid message structure:', data);
            return;
          }

          this.messageSubject.next(data as SensorData);
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
          console.error('Raw message was:', event.data);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        this.handleReconnection();
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.handleReconnection();
    }
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), 5000);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  public getMessages(): Observable<SensorData> {
    return this.messageSubject.asObservable();
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}
