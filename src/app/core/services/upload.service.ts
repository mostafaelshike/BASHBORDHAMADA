import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/models';

export interface UploadResult {
  url: string;
  publicId: string;
  format?: string;
  bytes?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(private api: ApiService) {}

  uploadImage(file: File, folder: string = 'medical_market'): Observable<ApiResponse<UploadResult>> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    return this.api.upload<ApiResponse<UploadResult>>('upload', formData);
  }

  uploadMultipleImages(files: File[], folder: string = 'medical_market'): Observable<ApiResponse<UploadResult[]>> {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    formData.append('folder', folder);
    return this.api.upload<ApiResponse<UploadResult[]>>('upload/multiple', formData);
  }
}
