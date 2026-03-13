import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../models/models';

const API = 'http://localhost:5000/api';

@Injectable({ providedIn: 'root' })
export class RoleService {
  constructor(private http: HttpClient) {}

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${API}/roles`);
  }

  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${API}/roles/${id}`);
  }

  createRole(payload: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(`${API}/roles`, payload);
  }

  updateRole(id: string, payload: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${API}/roles/${id}`, payload);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/roles/${id}`);
  }
}
