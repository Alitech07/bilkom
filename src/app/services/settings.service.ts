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

  getDeliveryTypes(): Observable<SettingsItem[]> {
    return this.http.get<ApiResult<SettingsItem[]>>(`${this.base}/delivery-types/list`).pipe(
      map(res => res.object ?? [])
    );
  }

  addDeliveryType(name: string): Observable<ApiResult<null>> {
    return this.http.post<ApiResult<null>>(`${this.base}/delivery-types/add`, { name });
  }

  editDeliveryType(id: number, name: string): Observable<ApiResult<null>> {
    return this.http.put<ApiResult<null>>(`${this.base}/delivery-types/edit/${id}`, { name });
  }

  deleteDeliveryType(id: number): Observable<ApiResult<null>> {
    return this.http.delete<ApiResult<null>>(`${this.base}/delivery-types/delete/${id}`);
  }

  getCurrencies(): Observable<SettingsItem[]> {
    return this.http.get<ApiResult<SettingsItem[]>>(`${this.base}/currencies/list`).pipe(
      map(res => res.object ?? [])
    );
  }

  addCurrency(name: string): Observable<ApiResult<null>> {
    return this.http.post<ApiResult<null>>(`${this.base}/currencies/add`, { name });
  }

  editCurrency(id: number, name: string): Observable<ApiResult<null>> {
    return this.http.put<ApiResult<null>>(`${this.base}/currencies/edit/${id}`, { name });
  }

  deleteCurrency(id: number): Observable<ApiResult<null>> {
    return this.http.delete<ApiResult<null>>(`${this.base}/currencies/delete/${id}`);
  }
}
