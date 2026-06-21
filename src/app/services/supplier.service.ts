import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Supplier {
  id: number;
  freightForwarder: string;
  legalName: string;
  brandName: string;
  typeOfActivity: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  isActive: string;
}

export interface SupplierDto {
  freightForwarder: string;
  legalName: string;
  brandName: string;
  typeOfActivity: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  isActive: string;
}

interface ApiResult<T> {
  success: boolean;
  message: string;
  object: T;
}

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private readonly base = `${environment.apiUrl}/suppliers`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Supplier[]> {
    return this.http.get<ApiResult<Supplier[]>>(`${this.base}/list`).pipe(
      map(res => res.object ?? [])
    );
  }

  getById(id: number): Observable<Supplier> {
    return this.http.get<ApiResult<Supplier>>(`${this.base}/${id}`).pipe(
      map(res => res.object)
    );
  }

  add(dto: SupplierDto): Observable<ApiResult<null>> {
    return this.http.post<ApiResult<null>>(`${this.base}/add`, dto);
  }

  edit(id: number, dto: SupplierDto): Observable<ApiResult<null>> {
    return this.http.put<ApiResult<null>>(`${this.base}/edit/${id}`, dto);
  }

  delete(id: number): Observable<ApiResult<null>> {
    return this.http.delete<ApiResult<null>>(`${this.base}/delete/${id}`);
  }
}
