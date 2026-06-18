import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  accessToken: string;
  username: string;
}

const ACCESS_KEY = 'blk_access';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly loginUrl = `${environment.apiUrl}/auth/login`;

  constructor(private http: HttpClient, private router: Router) {}

  login(login: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, { login, password }).pipe(
      tap(res => {
        localStorage.setItem(ACCESS_KEY, res.accessToken);
      })
    );
  }

  clearTokens(): void {
    localStorage.removeItem(ACCESS_KEY);
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
