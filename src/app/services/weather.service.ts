import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Observable, from, of, timer } from 'rxjs';
import { catchError, map, shareReplay, switchMap, take } from 'rxjs/operators';
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

    this.weather$ = this.coords$().pipe(
      switchMap(coords =>
        timer(0, REFRESH_MS).pipe(
          switchMap(() => this.fetch(coords.lat, coords.lon))
        )
      ),
      catchError(() => of(null)),
      shareReplay(1)
    );
  }

  private coords$(): Observable<{ lat: number; lon: number }> {
    const ipFallback$ = this.http.get<{ latitude: number; longitude: number }>('https://ipapi.co/json/').pipe(
      map(r => ({ lat: r.latitude, lon: r.longitude })),
      catchError(() => of({ lat: 41.2995, lon: 69.2401 }))
    );

    if (!navigator?.geolocation) {
      return ipFallback$;
    }

    return from(
      new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
      )
    ).pipe(
      map(pos => ({ lat: pos.coords.latitude, lon: pos.coords.longitude })),
      catchError(() => ipFallback$),
      take(1)
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
