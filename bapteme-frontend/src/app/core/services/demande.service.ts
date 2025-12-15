import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { DemandeExtrait, TelechargerResponse } from '../models/demande.model';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class DemandeService {
  private apiService = inject(ApiService);

  getAll(params?: any): Observable<PaginatedResponse<DemandeExtrait>> {
    return this.apiService.getPaginated<DemandeExtrait>('demandes', params);
  }

  getById(id: number): Observable<ApiResponse<DemandeExtrait>> {
    return this.apiService.get<DemandeExtrait>(`demandes/${id}`);
  }

  create(data: any): Observable<ApiResponse<DemandeExtrait>> {
    return this.apiService.post<DemandeExtrait>('demandes', data);
  }

  initierPaiement(id: number, data: any): Observable<ApiResponse<any>> {
    return this.apiService.post<any>(`demandes/${id}/paiement`, data);
  }

  traiter(id: number, data: any): Observable<ApiResponse<DemandeExtrait>> {
    return this.apiService.post<DemandeExtrait>(`demandes/${id}/traiter`, data);
  }

  telecharger(id: number): Observable<ApiResponse<TelechargerResponse>> {
    return this.apiService.get<TelechargerResponse>(`demandes/${id}/telecharger`);
  }
    telechargerExtrait(id: number): Observable<Blob> {
    return this.apiService.downloadFile(`demandes/${id}/telecharger`);
  }
}