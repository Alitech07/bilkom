import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export type ProductState = 'ACTIVE' | 'INACTIVE';

export interface Product {
  id: number;
  productName: string;
  composition: string;
  measure: string;
  countryManufacture: string;
  manufacturerName: string;
  state: ProductState;
}

export interface ProductDto {
  productName: string;
  composition: string;
  measure: string;
  countryManufacture: string;
  manufacturerName: string;
  state: ProductState;
}

interface ApiResult<T> {
  success: boolean;
  message: string;
  object: T;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly base = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<ApiResult<Product[]>>(`${this.base}/list`).pipe(
      map(res => res.object ?? [])
    );
  }

  getById(id: number): Observable<Product> {
    return this.http.get<ApiResult<Product>>(`${this.base}/${id}`).pipe(
      map(res => res.object)
    );
  }

  add(dto: ProductDto): Observable<ApiResult<null>> {
    return this.http.post<ApiResult<null>>(`${this.base}/add`, dto);
  }

  edit(id: number, dto: ProductDto): Observable<ApiResult<null>> {
    return this.http.put<ApiResult<null>>(`${this.base}/edit/${id}`, dto);
  }

  delete(id: number): Observable<ApiResult<null>> {
    return this.http.delete<ApiResult<null>>(`${this.base}/delete/${id}`);
  }
}
