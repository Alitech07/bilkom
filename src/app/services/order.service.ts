import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Warehouse } from './warehouse.service';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
export type OrderState = 'ACTIVE' | 'INACTIVE';

export interface OrderClient {
  id: number;
  clientName: string;
  address?: string;
  phone?: string;
  inn?: string;
}

export interface OrderItem {
  id: number;
  warehouse: Warehouse;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  client: OrderClient;
  orderDescription: string;
  totalAmount: number;
  status: OrderStatus;
  state: OrderState;
  createdOn: string;
  items: OrderItem[];
}

export interface OrderItemDto {
  warehouseId: number;
  quantity: number;
  price: number;
}

export interface OrderDto {
  clientId: number;
  orderDescription: string;
  status?: OrderStatus;
  state?: OrderState;
  items: OrderItemDto[];
}

interface ApiResult<T> {
  success: boolean;
  message: string;
  object: T;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly base = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Order[]> {
    return this.http.get<ApiResult<Order[]>>(`${this.base}/list`).pipe(
      map(res => res.object ?? [])
    );
  }

  getById(id: number): Observable<Order> {
    return this.http.get<ApiResult<Order>>(`${this.base}/${id}`).pipe(
      map(res => res.object)
    );
  }

  getByClient(clientId: number): Observable<Order[]> {
    return this.http.get<ApiResult<Order[]>>(`${this.base}/by-client/${clientId}`).pipe(
      map(res => res.object ?? [])
    );
  }

  add(dto: OrderDto): Observable<ApiResult<null>> {
    return this.http.post<ApiResult<null>>(`${this.base}/add`, dto);
  }

  edit(id: number, dto: OrderDto): Observable<ApiResult<null>> {
    return this.http.put<ApiResult<null>>(`${this.base}/edit/${id}`, dto);
  }

  delete(id: number): Observable<ApiResult<null>> {
    return this.http.delete<ApiResult<null>>(`${this.base}/delete/${id}`);
  }
}
