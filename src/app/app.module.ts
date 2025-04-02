import {BrowserModule} from '@angular/platform-browser';
import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CommonModule} from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {CoreModule} from './core/core.module';
import {NavigationModule} from './modules/navigation/navigation.module';
import {ThreeDModule} from './3d/three-d.module';
import {MatButtonModule} from '@angular/material/button';
import { MqttModule, IMqttServiceOptions } from 'ngx-mqtt';

export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: 'localhost',
  port: 9001,
  path: '/mqtt',
  protocol: 'ws'
};

@NgModule({ 
    declarations: [
        AppComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [MatButtonModule],
    bootstrap: [AppComponent], 
    imports: [
        BrowserModule,
        CommonModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        CoreModule,
        NavigationModule,
        ThreeDModule,
        MatButtonModule,
        MqttModule.forRoot(MQTT_SERVICE_OPTIONS)
    ], 
    providers: [provideHttpClient(withInterceptorsFromDi())] 
})
export class AppModule {
}
