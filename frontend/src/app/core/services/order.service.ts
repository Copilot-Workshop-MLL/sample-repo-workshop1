import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/product-order.models';

const API = 'http://localhost:5000/api/orders';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient) {}
  getAll(): Observable<Order[]> { return this.http.get<Order[]>(API); }
  getOne(id: string): Observable<Order> { return this.http.get<Order>(`${API}/${id}`); }
  create(data: Partial<Order>): Observable<Order> { return this.http.post<Order>(API, data); }
  update(id: string, data: Partial<Order>): Observable<Order> { return this.http.put<Order>(`${API}/${id}`, data); }
  delete(id: string): Observable<any> { return this.http.delete(`${API}/${id}`); }
}
