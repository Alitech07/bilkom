import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserRole {
  id: number;
  name: string;
  description: string;
}

export interface UserResponse {
  id: number;
  login: string;
  fullname: string;
  isActive: string;
  roles: UserRole[];
}

export interface UserDto {
  fullName: string;
  login: string;
  password: string;
  isActive: string;
  roleIds: number[];
}

interface ApiResult<T> {
  success: boolean;
  message: string;
  object: T;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly base = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<UserResponse[]> {
    return this.http.get<ApiResult<UserResponse[]>>(`${this.base}/list`).pipe(
      map(res => res.object ?? [])
    );
  }

  getById(id: number): Observable<UserResponse> {
    return this.http.get<ApiResult<UserResponse>>(`${this.base}/${id}`).pipe(
      map(res => res.object)
    );
  }

  add(dto: UserDto): Observable<ApiResult<null>> {
    return this.http.post<ApiResult<null>>(`${this.base}/add`, dto);
  }

  edit(id: number, dto: UserDto): Observable<ApiResult<null>> {
    return this.http.put<ApiResult<null>>(`${this.base}/edit/${id}`, dto);
  }

  delete(id: number): Observable<ApiResult<null>> {
    return this.http.delete<ApiResult<null>>(`${this.base}/delete/${id}`);
  }
}
