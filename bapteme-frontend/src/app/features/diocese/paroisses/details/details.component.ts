import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ApiService } from '../../../../core/services/api.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Paroisse } from '../../../../core/models/user.model';

interface ParoisseStats {
  total_baptemes: number;
  total_demandes: number;
  demandes_en_attente: number;
  demandes_traitees: number;
  baptemes_annee_courante: number;
  delai_moyen: number;
  baptemes_par_mois: any[];
  derniers_baptemes: any[];
  dernieres_demandes: any[];
}

@Component({
  selector: 'app-paroisse-details',
  standalone: true,
  imports: [
    CommonModule,
    
    CardModule,
    ButtonModule,
    TabViewModule,
    TableModule,
    ChartModule,
    TagModule,
    AvatarModule,
    DividerModule,
    SkeletonModule,
    TooltipModule,
    DialogModule
  ],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);

  paroisse: Paroisse | null = null;
  stats: ParoisseStats | null = null;
  loading = true;
  loadingStats = true;

  // Charts
  baptemesMoisChart: any;
  chartOptions: any;

  // Dialogs
  showEditDialog = false;

  constructor() {
    this.initChartOptions();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadParoisse(parseInt(id));
      this.loadStatistics(parseInt(id));
    }
  }

  loadParoisse(id: number): void {
    this.loading = true;
    this.apiService.get<Paroisse>(`paroisses/${id}`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.paroisse = response.data;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Erreur lors du chargement de la paroisse');
        this.router.navigate(['/diocese/paroisses']);
      }
    });
  }

  loadStatistics(id: number): void {
    this.loadingStats = true;
    this.apiService.get<ParoisseStats>(`paroisses/${id}/statistics`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data;
          this.prepareCharts();
        }
        this.loadingStats = false;
      },
      error: () => {
        this.loadingStats = false;
        this.notificationService.error('Erreur lors du chargement des statistiques');
      }
    });
  }

  prepareCharts(): void {
    if (!this.stats) return;

    const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    // Simuler des données (remplacer par vraies données)
    const baptemesData = [8, 12, 15, 10, 14, 16, 18, 20, 17, 22, 19, 25];

    this.baptemesMoisChart = {
      labels: moisLabels,
      datasets: [
        {
          label: 'Baptêmes',
          data: baptemesData,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }
      ]
    };
  }

  initChartOptions(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 5
          }
        }
      }
    };
  }

  openEditDialog(): void {
    this.showEditDialog = true;
  }

  getStatutSeverity(statut: string): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
  const severities: { [key: string]: "success" | "secondary" | "info" | "warning" | "danger" | "contrast" } = {
    'en_attente': 'warning',
    'en_cours': 'info',
    'valide': 'success',
    'pret': 'success',
    'rejete': 'danger'
  };
  return severities[statut] || 'secondary';
}

  exportData(): void {
    this.notificationService.info('Export en cours de développement...');
  }

  goBack(): void {
    this.router.navigate(['/diocese/paroisses']);
  }
}