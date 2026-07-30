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

export interface CurrentUser {
  login: string;
  fullname: string;
}

const ACCESS_KEY  = 'blk_access';
const MODULES_KEY = 'blk_modules';
const USER_KEY    = 'blk_user';

interface ApiResult<T> {
  success: boolean;
  object: T;
}

interface ApiResult<T> { success: boolean; object: T; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = environment.apiUrl;
  private _modules: SysModule[] = [];
  private _currentUser: CurrentUser | null = null;

  constructor(private http: HttpClient, private router: Router) {
    const rawModules = localStorage.getItem(MODULES_KEY);
    if (rawModules) { try { this._modules = JSON.parse(rawModules); } catch {} }

    const rawUser = localStorage.getItem(USER_KEY);
    if (rawUser) { try { this._currentUser = JSON.parse(rawUser); } catch {} }
  }

  login(login: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/auth/login`, { login, password }).pipe(
      tap(res => {
        localStorage.setItem(ACCESS_KEY, res.accessToken);
        this._currentUser = { login: res.username, fullname: res.username };
        localStorage.setItem(USER_KEY, JSON.stringify(this._currentUser));
      })
    );
  }

  loadCurrentUser(): Observable<void> {
    return this.http
      .get<ApiResult<{ id: number; login: string; fullname: string }>>(`${this.base}/user/me`)
      .pipe(
        tap(res => {
          this._currentUser = { login: res.object.login, fullname: res.object.fullname };
          localStorage.setItem(USER_KEY, JSON.stringify(this._currentUser));
        }),
        map(() => void 0)
      );
  }

  get currentUser(): CurrentUser | null {
    return this._currentUser;
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
    this._currentUser = null;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(MODULES_KEY);
    localStorage.removeItem(USER_KEY);
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
