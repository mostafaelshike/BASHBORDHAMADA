import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Category } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private api: ApiService) {}

  getCategories(params?: any): Observable<ApiResponse<Category[]>> {
    return this.api.get<ApiResponse<Category[]>>('categories', params);
  }

  getCategory(idOrSlug: string): Observable<ApiResponse<Category>> {
    return this.api.get<ApiResponse<Category>>(`categories/${idOrSlug}`);
  }

  createCategory(category: Partial<Category>): Observable<ApiResponse<Category>> {
    return this.api.post<ApiResponse<Category>>('categories', category);
  }

  updateCategory(id: string, category: Partial<Category>): Observable<ApiResponse<Category>> {
    return this.api.put<ApiResponse<Category>>(`categories/${id}`, category);
  }

  deleteCategory(id: string): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>(`categories/${id}`);
  }
}
