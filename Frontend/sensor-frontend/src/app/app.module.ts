import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { WebsocketService } from './services/websocket.service';
import { SensorDataService } from './services/sensor-data.service';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    WebsocketService,
    SensorDataService
  ],
  bootstrap: []
})
export class AppModule { }