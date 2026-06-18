import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Permission } from './permission.service';

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface RoleDto {
  name: string;
  description: string;
  permissionIds?: number[];
}

interface ApiResult<T> {
  success: boolean;
  message: string;
  object: T;
}

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly base = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Role[]> {
    return this.http.get<ApiResult<Role[]>>(`${this.base}/list`).pipe(
      map(res => res.object ?? [])
    );
  }

  getById(id: number): Observable<Role> {
    return this.http.get<ApiResult<Role>>(`${this.base}/${id}`).pipe(
      map(res => res.object)
    );
  }

  add(dto: RoleDto): Observable<ApiResult<null>> {
    return this.http.post<ApiResult<null>>(`${this.base}/add`, dto);
  }

  edit(id: number, dto: RoleDto): Observable<ApiResult<null>> {
    return this.http.put<ApiResult<null>>(`${this.base}/edit/${id}`, dto);
  }

  delete(id: number): Observable<ApiResult<null>> {
    return this.http.delete<ApiResult<null>>(`${this.base}/delete/${id}`);
  }
}
