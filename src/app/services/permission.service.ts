import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Permission {
  id: number;
  code: string;
  description: string;
  module: string;
}

export interface PermissionRow {
  permission: Permission;
  action: string;
  checked: boolean;
}

export interface ModuleGroup {
  moduleName: string;
  rows: PermissionRow[];
}

interface ApiResult<T> {
  success: boolean;
  message: string;
  object: T;
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private base = `${environment.apiUrl}/permission`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Permission[]> {
    return this.http.get<ApiResult<Permission[]>>(`${this.base}/list`).pipe(
      map(res => res.object ?? [])
    );
  }

  groupByModule(permissions: Permission[]): ModuleGroup[] {
    const map = new Map<string, PermissionRow[]>();

    for (const p of permissions) {
      const moduleName = p.module ?? 'BOSHQA';
      const action = this.extractAction(p.code, moduleName);
      if (!map.has(moduleName)) map.set(moduleName, []);
      map.get(moduleName)!.push({ permission: p, action, checked: false });
    }

    return Array.from(map.entries()).map(([moduleName, rows]) => ({ moduleName, rows }));
  }

  private extractAction(code: string, moduleName: string): string {
    const prefix = moduleName + '_';
    const action = code.startsWith(prefix) ? code.slice(prefix.length) : code.split('_').pop() ?? code;
    return action.toLowerCase();
  }
}
