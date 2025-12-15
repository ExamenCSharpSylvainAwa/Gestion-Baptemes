import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Bapteme } from '../models/bapteme.model';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class BaptemeService {
  private apiService = inject(ApiService);

  getAll(params?: any): Observable<PaginatedResponse> {
    return this.apiService.getPaginated('baptemes', params);
  }

  getById(id: number): Observable<ApiResponse> {
    return this.apiService.get(`baptemes/${id}`);
  }

  create(data: any): Observable<ApiResponse> {
    return this.apiService.post('baptemes', data);
  }

  update(id: number, data: any): Observable<ApiResponse> {
    return this.apiService.put(`baptemes/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse> {
    return this.apiService.delete(`baptemes/${id}`);
  }

  search(params: any): Observable<ApiResponse> {
    return this.apiService.post('baptemes/search', params);
  }
}