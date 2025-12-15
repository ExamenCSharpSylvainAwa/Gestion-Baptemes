import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ApiService } from '../../../core/services/api.service';
import { DemandeExtrait } from '../../../core/models/demande.model';

interface DashboardStats {
  total_demandes: number;
  demandes_en_cours: number;
  demandes_pretes: number;
  dernieres_demandes: DemandeExtrait[];
}

// ✅ Type Severity pour PrimeNG p-tag
type TagSeverity = "success" | "secondary" | "info" | "warning" | "danger" | "contrast";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    SkeletonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  
  stats: DashboardStats | null = null;
  loading = true;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.apiService.get<DashboardStats>('dashboard/citoyen').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // ✅ MÉTHODE CORRIGÉE
  getStatutSeverity(statut: string): TagSeverity {
    const severities: Record<string, TagSeverity> = {
      'en_attente': 'warning',  // ✅ 'warn' → 'warning'
      'en_cours': 'info',
      'valide': 'success',
      'pret': 'success',
      'rejete': 'danger'
    };
    return severities[statut] || 'secondary';
  }
}