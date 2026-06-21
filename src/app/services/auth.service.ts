import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { SysModule } from './module.service';

export interface LoginResponse {
  accessToken: string;
  username: string;
}

const ACCESS_KEY  = 'blk_access';
const MODULES_KEY = 'blk_modules';

interface ApiResult<T> {
  success: boolean;
  object: T;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = environment.apiUrl;
  private _modules: SysModule[] = [];

  constructor(private http: HttpClient, private router: Router) {
    const raw = localStorage.getItem(MODULES_KEY);
    if (raw) { try { this._modules = JSON.parse(raw); } catch {} }
  }

  login(login: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/auth/login`, { login, password }).pipe(
      tap(res => localStorage.setItem(ACCESS_KEY, res.accessToken))
    );
  }

  loadModules(): Observable<void> {
    return this.http
      .get<ApiResult<SysModule[]>>(`${this.base}/modules/my-modules`)
      .pipe(
        tap(res => {
          this._modules = res.object ?? [];
          localStorage.setItem(MODULES_KEY, JSON.stringify(this._modules));
        }),
        map(() => void 0)
      );
  }

  get myModules(): SysModule[] {
    return this._modules;
  }

  clearTokens(): void {
    this._modules = [];
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(MODULES_KEY);
  }

  logout(): void {
    this.clearTokens();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
