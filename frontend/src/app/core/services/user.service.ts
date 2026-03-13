import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/models';

const API = 'http://localhost:5000/api';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${API}/users`);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${API}/users/${id}`);
  }

  createUser(payload: Partial<User> & { password: string }): Observable<User> {
    return this.http.post<User>(`${API}/users`, payload);
  }

  updateUser(id: string, payload: Partial<User>): Observable<User> {
    return this.http.put<User>(`${API}/users/${id}`, payload);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/users/${id}`);
  }
}
