import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

export interface CurrencyRate {
  Ccy: string;
  CcyNm_UZ: string;
  Rate: string;
  Diff: string;
  Date: string;
}

const CBU_URL = 'https://cbu.uz/uz/arkhiv-kursov-valyut/json/';
const SHOW = ['USD', 'EUR', 'TRY'];
const REFRESH_MS = 30 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private http: HttpClient;

  readonly rates$: Observable<CurrencyRate[]>;

  constructor(handler: HttpBackend) {
    this.http = new HttpClient(handler);

    this.rates$ = timer(0, REFRESH_MS).pipe(
      switchMap(() => this.http.get<CurrencyRate[]>(CBU_URL)),
      map(all => all.filter(r => SHOW.includes(r.Ccy))),
      shareReplay(1)
    );
  }
}
