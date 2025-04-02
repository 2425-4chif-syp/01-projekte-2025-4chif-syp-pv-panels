import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Sensortype} from '../../shared/models/sensortype.model';
import {Observable} from 'rxjs';

// const url = `${environment.vmUrl}:${environment.vmPort}${environment.corePathPrefix}`;
const url = `http://localhost:3000/sensortypes`;

@Injectable({
  providedIn: 'root'
})
export class SensortypeService {

  sensortypes: Sensortype[] = [];
  defaultSensortypes: Sensortype[] = [
    {'name' : 'temperature', unit: '°C'},
    {'name' : 'co2', unit: 'PPM'},
    {'name' : 'humidity', unit: '%'},
    {'name' : 'luminosity', unit: 'LUX'},
    // {'name' : 'noise', unit: ''},
    {'name' : 'volume', unit: 'dB'}
  ];

  constructor(private http: HttpClient) {
  }

  async getSensortypes() {
    if (this.sensortypes.length === 0) {
      await this.getSensortypesFromBackend().toPromise().then((data) => {
        this.sensortypes = data;
      }).catch((err) => {
        this.sensortypes = this.defaultSensortypes;
      });
    }
    return this.sensortypes;
  }

  getSensortypesFromBackend(): Observable<Sensortype[]> {
    return this.http.get<Sensortype[]>(`${url}`);
  }
}
