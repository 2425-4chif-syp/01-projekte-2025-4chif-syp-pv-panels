import { Injectable } from '@angular/core';
import { HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService{
private apiUrl = 'https://api.open-meteo.com/v1/forecast';

  constructor(private client: HttpClient ) { }

  getWeatherForecast(latitude: number, longitude: number): Observable<any>{
    const params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString())
      .set('hourly', 'temperature_2m,weathercode')
      .set('daily', 'weathercode,temperature_2m_max,temperature_2m_min')
      .set('timezone', 'Europe/Vienna');

    return this.client.get<any>(this.apiUrl, {params});
  }
}
