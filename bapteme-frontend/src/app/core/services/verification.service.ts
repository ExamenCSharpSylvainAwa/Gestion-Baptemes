import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VerificationResult } from '../models/verification.model';

@Injectable({
  providedIn: 'root'
})
export class VerificationService {
  private http = inject(HttpClient);

  verifier(numeroUnique: string): Observable<VerificationResult> {
    return this.http.get<VerificationResult>(
      `${environment.apiUrl}/extraits/verify/${numeroUnique}`
    );
  }
}