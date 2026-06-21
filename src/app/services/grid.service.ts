import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GridColumn {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'number' | 'date';
  exportable?: boolean;
  visible?: boolean;
  width?: string;
  badgeMap?: Record<string, 'green' | 'blue' | 'yellow' | 'red' | 'gray'>;
}

// externalConfig rejimi uchun (Suppliers, Roles sahifalari)
export interface GridConfig {
  title: string;
  columns: GridColumn[];
  data: Record<string, any>[];
}

// API rejimi uchun (gridId orqali yuklanadigan sahifalar)
export interface GridPageConfig {
  page: number;
  search: boolean;
  filter: boolean;
  checkbox: boolean;
  showFile: boolean;
}

export interface GridPage {
  gridConfig: GridPageConfig;
  gridColumns: GridColumn[];
  data: Record<string, any>[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

interface ApiResult<T> {
  success: boolean;
  message: string;
  object: T;
}

@Injectable({ providedIn: 'root' })
export class GridService {
  private readonly base = `${environment.apiUrl}/grids`;

  constructor(private http: HttpClient) {}

  getGrid(gridId: number, page: number = 0): Observable<GridPage> {
    return this.http
      .get<ApiResult<GridPage>>(`${this.base}/${gridId}?page=${page}`)
      .pipe(map(res => res.object));
  }
}
