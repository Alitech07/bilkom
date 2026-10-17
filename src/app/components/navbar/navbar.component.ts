import { Component, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CurrencyRate, CurrencyService } from '../../services/currency.service';
import { WeatherData, WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Output() menuToggle = new EventEmitter<void>();

  readonly currencies$: Observable<CurrencyRate[]>;
  readonly weather$: Observable<WeatherData | null>;
  showWeatherPanel = false;

  private _closeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private auth: AuthService, currency: CurrencyService, weather: WeatherService) {
    this.currencies$ = currency.rates$;
    this.weather$ = weather.weather$;
  }

  onWeatherEnter(): void {
    if (this._closeTimer) { clearTimeout(this._closeTimer); this._closeTimer = null; }
    this.showWeatherPanel = true;
  }

  onWeatherLeave(): void {
    this._closeTimer = setTimeout(() => { this.showWeatherPanel = false; }, 150);
  }

  diff(rate: CurrencyRate): number {
    return parseFloat(rate.Diff);
  }

  get initials(): string {
    const name = this.auth.currentUser?.fullname ?? this.auth.currentUser?.login ?? '?';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }

  get displayName(): string {
    return this.auth.currentUser?.fullname ?? this.auth.currentUser?.login ?? '';
  }

  get displayLogin(): string {
    return this.auth.currentUser?.login ?? '';
  }

  logout(): void {
    this.auth.logout();
  }
}
