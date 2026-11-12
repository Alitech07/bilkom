import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SettingsItem {
  id: number;
  name: string;
}

export interface CurrencyRate {
  id: number;
  currency: SettingsItem;
  rate: number;
  rateDate: string;
}

export interface CurrencyRateDto {
  currencyId: number;
  rate: number;
  rateDate: string;
}

export function isSomCurrency(name: string): boolean {
  const n = (name ?? '').toLowerCase().replace(/['`ʻʼ‘’\s]/g, '');
  return n === 'uzs' || n === 'som' || n === 'sum';
}

interface ApiResult<T> {
  success: boolean;
  message: string;
  object: T;
  warning?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly base = `${environment.apiUrl}/settings`;
  private readonly rates$ = new BehaviorSubject<CurrencyRate[]>([]);

  /** Latest manually entered rate per currency (list is sorted newest first by the API). */
  readonly currentRates$: Observable<CurrencyRate[]> = this.rates$.pipe(
    map(list => {
      const seen = new Set<number>();
      return list.filter(r => !seen.has(r.currency.id) && !!seen.add(r.currency.id));
    })
  );

  constructor(private http: HttpClient) {}

  refreshRates(): void {
    this.getCurrencyRates().subscribe({ error: () => {} });
  }

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

  getCurrencyRates(): Observable<CurrencyRate[]> {
    return this.http.get<ApiResult<CurrencyRate[]>>(`${this.base}/currency-rates/list`).pipe(
      map(res => res.object ?? []),
      tap(list => this.rates$.next(list))
    );
  }

  addCurrencyRate(dto: CurrencyRateDto): Observable<ApiResult<null>> {
    return this.http.post<ApiResult<null>>(`${this.base}/currency-rates/add`, dto);
  }

  deleteCurrencyRate(id: number): Observable<ApiResult<null>> {
    return this.http.delete<ApiResult<null>>(`${this.base}/currency-rates/delete/${id}`);
  }
}

