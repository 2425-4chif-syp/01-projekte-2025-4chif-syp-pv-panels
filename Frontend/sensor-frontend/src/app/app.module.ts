import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SensorDetailsComponent } from './components/sensor-details/sensor-details.component';
import { RoomCardComponent } from './components/room-card/room-card.component';
import { WebsocketService } from './services/websocket.service';
import { SensorDataService } from './services/sensor-data.service';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SensorDetailsComponent,
    RoomCardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    WebsocketService,
    SensorDataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { } 