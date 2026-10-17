import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Observable, from, of, timer } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  clouds: number;
}

interface OWMResponse {
  name: string;
  sys: { country: string };
  main: { temp: number; feels_like: number; humidity: number; pressure: number };
  weather: [{ description: string; icon: string }];
  wind: { speed: number };
  visibility: number;
  clouds: { all: number };
}

const REFRESH_MS = 10 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private http: HttpClient;

  readonly weather$: Observable<WeatherData | null>;

  constructor(handler: HttpBackend) {
    this.http = new HttpClient(handler);

    this.weather$ = this.position$().pipe(
      switchMap(pos =>
        timer(0, REFRESH_MS).pipe(
          switchMap(() => this.fetch(pos.coords.latitude, pos.coords.longitude))
        )
      ),
      catchError(() => of(null)),
      shareReplay(1)
    );
  }

  private position$(): Observable<GeolocationPosition> {
    return from(
      new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      )
    );
  }

  private fetch(lat: number, lon: number): Observable<WeatherData> {
    const url = `https://api.openweathermap.org/data/2.5/weather`
      + `?lat=${lat}&lon=${lon}&appid=${environment.weatherApiKey}&units=metric&lang=uz`;

    return this.http.get<OWMResponse>(url).pipe(
      map(r => ({
        city: r.name,
        country: r.sys.country,
        temp: Math.round(r.main.temp),
        feelsLike: Math.round(r.main.feels_like),
        description: r.weather[0].description,
        icon: r.weather[0].icon,
        humidity: r.main.humidity,
        windSpeed: r.wind.speed,
        pressure: r.main.pressure,
        visibility: Math.round(r.visibility / 1000),
        clouds: r.clouds.all,
      }))
    );
  }
}
