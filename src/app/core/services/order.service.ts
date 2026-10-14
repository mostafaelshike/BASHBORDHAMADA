import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Order } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private api: ApiService) {}

  getAllOrders(params?: any): Observable<ApiResponse<Order[]>> {
    return this.api.get<ApiResponse<Order[]>>('orders', params);
  }

  getOrderById(id: string): Observable<ApiResponse<Order>> {
    return this.api.get<ApiResponse<Order>>(`orders/${id}`);
  }

  updateOrderStatus(id: string, data: { orderStatus?: string; trackingNumber?: string; medicalVerificationStatus?: string }): Observable<ApiResponse<Order>> {
    return this.api.put<ApiResponse<Order>>(`orders/${id}/status`, data);
  }

  updatePaymentStatus(id: string, paymentStatus: string): Observable<ApiResponse<Order>> {
    return this.api.put<ApiResponse<Order>>(`orders/${id}/payment`, { paymentStatus });
  }

  deleteOrder(id: string): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>(`orders/${id}`);
  }
}
