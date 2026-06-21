import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export type EmployeeState = 'ACTIVE' | 'INACTIVE';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  middleName: string;
  phoneNumber: string;
  state: EmployeeState;
  email: string;
  address: string;
  inps: string;
  pasportCode: string;
  photo: string;
}

export interface EmployeeDto {
  firstName: string;
  lastName: string;
  middleName: string;
  phoneNumber: string;
  state: EmployeeState;
  email: string;
  address: string;
  inps: string;
  pasportCode: string;
  photo: string;
}

interface ApiResult<T> {
  success: boolean;
  message: string;
  object: T;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly base = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Employee[]> {
    return this.http.get<ApiResult<Employee[]>>(`${this.base}/list`).pipe(
      map(res => res.object ?? [])
    );
  }

  getById(id: number): Observable<Employee> {
    return this.http.get<ApiResult<Employee>>(`${this.base}/${id}`).pipe(
      map(res => res.object)
    );
  }

  add(dto: EmployeeDto): Observable<ApiResult<null>> {
    return this.http.post<ApiResult<null>>(`${this.base}/add`, dto);
  }

  edit(id: number, dto: EmployeeDto): Observable<ApiResult<null>> {
    return this.http.put<ApiResult<null>>(`${this.base}/edit/${id}`, dto);
  }

  delete(id: number): Observable<ApiResult<null>> {
    return this.http.delete<ApiResult<null>>(`${this.base}/delete/${id}`);
  }
}
