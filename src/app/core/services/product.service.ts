import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Product } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private api: ApiService) {}

  getProducts(params?: any): Observable<ApiResponse<Product[]>> {
    return this.api.get<ApiResponse<Product[]>>('products', params);
  }

  getFeaturedProducts(limit: number = 8): Observable<ApiResponse<Product[]>> {
    return this.api.get<ApiResponse<Product[]>>('products/featured', { limit });
  }

  getProduct(idOrSku: string): Observable<ApiResponse<Product> & { related?: Product[] }> {
    return this.api.get<ApiResponse<Product> & { related?: Product[] }>(`products/${idOrSku}`);
  }

  createProduct(product: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.api.post<ApiResponse<Product>>('products', product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.api.put<ApiResponse<Product>>(`products/${id}`, product);
  }

  deleteProduct(id: string): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>(`products/${id}`);
  }

  getLowStockProducts(): Observable<ApiResponse<Product[]>> {
    return this.api.get<ApiResponse<Product[]>>('products/alerts/low-stock');
  }
}
