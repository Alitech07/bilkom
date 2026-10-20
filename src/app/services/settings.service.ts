import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SettingsItem {
  id: number;
  name: string;
}

interface ApiResult<T> {
  success: boolean;
  message: string;
  object: T;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly base = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) {}

  getPaymentTypes(): Observable<SettingsItem[]> {
    return this.http.get<ApiResult<SettingsItem[]>>(`${this.base}/payment-types/list`).pipe(
      map(res => res.object ?? [])
    );
  }

  addPaymentType(name: string): Observable<ApiResult<null>> {
    return this.http.post<ApiResult<null>>(`${this.base}/payment-types/add`, { name });
  }

  editPaymentType(id: number, name: string): Observable<ApiResult<null>> {
    return this.http.put<ApiResult<null>>(`${this.base}/payment-types/edit/${id}`, { name });
  }

  deletePaymentType(id: number): Observable<ApiResult<null>> {
    return this.http.delete<ApiResult<null>>(`${this.base}/payment-types/delete/${id}`);
  }
}
