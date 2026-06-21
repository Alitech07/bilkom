import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SysSection {
  id: number;
  name: string;
  label: string;
  orderNum: number;
}

export interface SysModule {
  id: number;
  name: string;
  label: string;
  route: string;
  section: SysSection;
  orderNum: number;
  state: string;
}

export interface SysModuleDto {
  name: string;
  label: string;
  route: string;
  sectionId: number;
  orderNum: number;
  state: string;
}

interface ApiResult<T> {
  success: boolean;
  message: string;
  object: T;
}

@Injectable({ providedIn: 'root' })
export class ModuleService {
  private readonly base = `${environment.apiUrl}/modules`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<SysModule[]> {
    return this.http.get<ApiResult<SysModule[]>>(`${this.base}/list`).pipe(
      map(res => res.object ?? [])
    );
  }

  getMyModules(): Observable<SysModule[]> {
    return this.http.get<ApiResult<SysModule[]>>(`${this.base}/my-modules`).pipe(
      map(res => res.object ?? [])
    );
  }

  add(dto: SysModuleDto): Observable<ApiResult<null>> {
    return this.http.post<ApiResult<null>>(`${this.base}/add`, dto);
  }

  edit(id: number, dto: SysModuleDto): Observable<ApiResult<null>> {
    return this.http.put<ApiResult<null>>(`${this.base}/edit/${id}`, dto);
  }

  delete(id: number): Observable<ApiResult<null>> {
    return this.http.delete<ApiResult<null>>(`${this.base}/delete/${id}`);
  }
}
