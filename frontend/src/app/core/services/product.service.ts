import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product-order.models';

const API = 'http://localhost:5000/api/products';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient) {}
  getAll(): Observable<Product[]> { return this.http.get<Product[]>(API); }
  getOne(id: string): Observable<Product> { return this.http.get<Product>(`${API}/${id}`); }
  create(data: Partial<Product>): Observable<Product> { return this.http.post<Product>(API, data); }
  update(id: string, data: Partial<Product>): Observable<Product> { return this.http.put<Product>(`${API}/${id}`, data); }
  delete(id: string): Observable<any> { return this.http.delete(`${API}/${id}`); }
}
