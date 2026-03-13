import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, User } from '../models/models';

const API = 'http://localhost:5000/api';
const TOKEN_KEY = 'rbac_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const token = this.getToken();
    if (token) {
      this.fetchMe().subscribe();
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/login`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.token);
        this.currentUserSubject.next(res.user);
      })
    );
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/register`, { name, email, password }).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.token);
        this.currentUserSubject.next(res.user);
      })
    );
  }

  fetchMe(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${API}/auth/me`).pipe(
      tap((res) => this.currentUserSubject.next(res.user))
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
