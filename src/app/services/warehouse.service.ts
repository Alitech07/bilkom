import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from './product.service';

export interface WarehouseDto {
  productId: number;
  residual: number;
  measure: string;
  storageSpace: string;
  state: 'ACTIVE' | 'INACTIVE';
}

interface ApiResult<T> {
  success: boolean;
  message: string;
  object: T;
}

@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private readonly base = `${environment.apiUrl}/warehouse`;

  constructor(private http: HttpClient) {}

  getById(id: number): Observable<any> {
    return this.http.get<ApiResult<any>>(`${this.base}/${id}`).pipe(
      map(res => res.object)
    );
  }

  getFreeProducts(): Observable<Product[]> {
    return this.http.get<ApiResult<Product[]>>(`${this.base}/free-products`).pipe(
      map(res => res.object ?? [])
    );
  }

  add(dto: WarehouseDto): Observable<ApiResult<null>> {
    return this.http.post<ApiResult<null>>(`${this.base}/add`, dto);
  }

  edit(id: number, dto: WarehouseDto): Observable<ApiResult<null>> {
    return this.http.put<ApiResult<null>>(`${this.base}/edit/${id}`, dto);
  }

  delete(id: number): Observable<ApiResult<null>> {
    return this.http.delete<ApiResult<null>>(`${this.base}/delete/${id}`);
  }
}
