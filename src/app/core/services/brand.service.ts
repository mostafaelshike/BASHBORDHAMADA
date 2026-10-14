import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Brand } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  constructor(private api: ApiService) {}

  getBrands(params?: any): Observable<ApiResponse<Brand[]>> {
    return this.api.get<ApiResponse<Brand[]>>('brands', params);
  }

  getBrand(idOrSlug: string): Observable<ApiResponse<Brand>> {
    return this.api.get<ApiResponse<Brand>>(`brands/${idOrSlug}`);
  }

  createBrand(brand: Partial<Brand>): Observable<ApiResponse<Brand>> {
    return this.api.post<ApiResponse<Brand>>('brands', brand);
  }

  updateBrand(id: string, brand: Partial<Brand>): Observable<ApiResponse<Brand>> {
    return this.api.put<ApiResponse<Brand>>(`brands/${id}`, brand);
  }

  deleteBrand(id: string): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>(`brands/${id}`);
  }
}
