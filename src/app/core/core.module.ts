import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { HistoricalMeasurementService } from './services/historical-measurements.service';
import { LiveMeasurementService } from './services/live-measurements.service';
import { NotificationService } from './services/notification.service';
import { TramService } from './services/tram.service';
import { WeatherService } from './services/weather.service';
import { LanguageService } from './services/language.service';
import { AutoplayService } from './services/autoplay.service';

import { MqttModule, IMqttServiceOptions } from 'ngx-mqtt';

export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: `${environment.mqttUrl}`,
  protocol: 'wss',
  port: environment.mqttPort,
  username: 'leo-user',
  password: 'E!2qH9cc9G'
};

@NgModule({
  imports: [
    CommonModule,
    MqttModule
  ],
  providers: [
    AutoplayService,
    HistoricalMeasurementService,
    LanguageService,
    LiveMeasurementService,
    NotificationService,
    TramService,
    WeatherService,
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class CoreModule {
  static forRoot(config: IMqttServiceOptions = MQTT_SERVICE_OPTIONS) {
    return {
      ngModule: CoreModule,
      providers: [
        { provide: 'MQTT_CONFIG', useValue: config },
        MqttModule.forRoot(config).providers
      ]
    };
  }
}

