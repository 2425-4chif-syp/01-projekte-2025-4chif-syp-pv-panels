/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

registerLocaleData(localeDe); // Deutsche Lokalisierung registrieren

bootstrapApplication(AppComponent, {
  providers: [
    { provide: LOCALE_ID, useValue: 'de-DE' }, // LOCALE_ID auf Deutsch setzen
    ...appConfig.providers
  ]
}).catch(err => console.error(err));
