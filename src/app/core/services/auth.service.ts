import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);

  constructor(private api: ApiService, private router: Router) {
    this.loadUserFromStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('medical-market:session-expired', () => {
        this.token.set(null);
        this.currentUser.set(null);
      });
    }
  }

  private loadUserFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      if (savedToken && savedUser) {
        try {
          this.token.set(savedToken);
          this.currentUser.set(JSON.parse(savedUser));
        } catch (e) {
          this.logout();
        }
      }
    }
  }

  login(credentials: { email: string; password: string }): Observable<ApiResponse<User>> {
    return this.api.post<ApiResponse<User>>('auth/login', credentials).pipe(
      tap((res) => {
        if (res.success && res.data && res.data.token) {
          this.saveAuth(res.data.token, res.data);
        }
      })
    );
  }

  getMe(): Observable<ApiResponse<User>> {
    return this.api.get<ApiResponse<User>>('auth/me').pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.currentUser.set(res.data);
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        }
      })
    );
  }

  updateProfile(data: Partial<User>): Observable<ApiResponse<User>> {
    return this.api.put<ApiResponse<User>>('auth/updatedetails', data).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.currentUser.set(res.data);
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        }
      })
    );
  }

  private saveAuth(token: string, user: User): void {
    this.token.set(token);
    this.currentUser.set(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }
}
