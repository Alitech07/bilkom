import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subscription, timer } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CurrencyRate, CurrencyService } from '../../services/currency.service';
import { CurrencyRate as SystemRate, SettingsService } from '../../services/settings.service';
import { WeatherData, WeatherService } from '../../services/weather.service';
import { environment } from '../../../environments/environment';

const SYSTEM_RATES_REFRESH_MS = 5 * 60 * 1000;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() menuToggle = new EventEmitter<void>();

  readonly currencies$: Observable<CurrencyRate[]>;
  readonly systemRates$: Observable<SystemRate[]>;
  readonly weather$: Observable<WeatherData | null>;
  showWeatherPanel = false;

  private _closeTimer: ReturnType<typeof setTimeout> | null = null;
  private _ratesSub?: Subscription;

  constructor(
    private auth: AuthService,
    currency: CurrencyService,
    private settings: SettingsService,
    weather: WeatherService,
    private router: Router,
  ) {
    this.currencies$ = currency.rates$;
    this.systemRates$ = settings.currentRates$;
    this.weather$ = weather.weather$;
  }

  ngOnInit(): void {
    this._ratesSub = timer(0, SYSTEM_RATES_REFRESH_MS).subscribe(() => this.settings.refreshRates());
  }

  ngOnDestroy(): void {
    this._ratesSub?.unsubscribe();
    if (this._closeTimer) clearTimeout(this._closeTimer);
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

  get avatarUrl(): string | null {
    const path = this.auth.currentUser?.avatarPath;
    if (!path) return null;
    const fileName = path.split('/').pop() ?? '';
    return `${environment.apiUrl}/user/avatar/${fileName}`;
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.auth.logout();
  }
}
