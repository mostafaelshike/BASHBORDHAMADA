import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, DashboardStats } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  constructor(private api: ApiService) {}

  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.api.get<ApiResponse<DashboardStats>>('stats/dashboard');
  }
}
