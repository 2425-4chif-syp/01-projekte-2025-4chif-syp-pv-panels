import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { WebsocketService } from './app/services/websocket.service';
import { SensorDataService } from './app/services/sensor-data.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    WebsocketService,
    SensorDataService
  ]
}).catch(err => console.error(err));
