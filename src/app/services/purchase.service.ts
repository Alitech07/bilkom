import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PurchaseSupplier {
  id: number;
  legalName: string;
  brandName: string;
}

export interface Purchase {
  id: number;
  productName: string;
  brand: string;
  country: string;
  deliveryType: string;
  price: number;
  status: string;
  state: string;
  supplier: PurchaseSupplier;
}

export interface PurchaseDto {
  supplierId: number;
  productName: string;
  country: string;
  brand: string;
  deliveryType: string;
  certificatePath: string;
  price: number;
}

interface ApiResult<T> {
  success: boolean;
  message: string;
  object: T;
}

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private readonly base = `${environment.apiUrl}/purchases`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Purchase[]> {
    return this.http.get<ApiResult<Purchase[]>>(`${this.base}/list`).pipe(
      map(res => res.object ?? [])
    );
  }

  add(dto: PurchaseDto): Observable<ApiResult<null>> {
    return this.http.post<ApiResult<null>>(`${this.base}/add`, dto);
  }

  edit(id: number, dto: PurchaseDto): Observable<ApiResult<null>> {
    return this.http.put<ApiResult<null>>(`${this.base}/edit/${id}`, dto);
  }

  delete(id: number): Observable<ApiResult<null>> {
    return this.http.delete<ApiResult<null>>(`${this.base}/delete/${id}`);
  }

  uploadCertificate(file: File): Observable<string> {
    const form = new FormData();
    form.append('file', file);
    return this.http
      .post<ApiResult<string>>(`${this.base}/upload-certificate`, form)
      .pipe(map(res => res.object));
  }
}
