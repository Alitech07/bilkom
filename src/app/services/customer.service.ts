import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export type ClientState = 'ACTIVE' | 'INACTIVE';

export interface Client {
  id: number;
  clientName: string;
  address: string;
  phone: string;
  inn: string;
  email: string;
  region: string;
  state: ClientState;
  employee?: { id: number; fullname: string } | null;
}

export interface ClientDto {
  clientName: string;
  address: string;
  phone: string;
  inn: string;
  email: string;
  region: string;
  state: ClientState;
  empId?: number | null;
}

interface ApiResult<T> {
  success: boolean;
  message: string;
  object: T;
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly base = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  getById(id: number): Observable<Client> {
    return this.http.get<ApiResult<Client>>(`${this.base}/${id}`).pipe(
      map(res => res.object)
    );
  }

  add(dto: ClientDto): Observable<ApiResult<null>> {
    return this.http.post<ApiResult<null>>(`${this.base}/add`, dto);
  }

  edit(id: number, dto: ClientDto): Observable<ApiResult<null>> {
    return this.http.put<ApiResult<null>>(`${this.base}/edit/${id}`, dto);
  }

  delete(id: number): Observable<ApiResult<null>> {
    return this.http.delete<ApiResult<null>>(`${this.base}/delete/${id}`);
  }
}
