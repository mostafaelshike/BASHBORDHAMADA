import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private api: ApiService) {}

  getUsers(params?: any): Observable<ApiResponse<User[]>> {
    return this.api.get<ApiResponse<User[]>>('users', params);
  }

  getUser(id: string): Observable<ApiResponse<User>> {
    return this.api.get<ApiResponse<User>>(`users/${id}`);
  }

  createUser(user: Partial<User>): Observable<ApiResponse<User>> {
    return this.api.post<ApiResponse<User>>('users', user);
  }

  updateUser(id: string, user: Partial<User>): Observable<ApiResponse<User>> {
    return this.api.put<ApiResponse<User>>(`users/${id}`, user);
  }

  deleteUser(id: string): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>(`users/${id}`);
  }
}
