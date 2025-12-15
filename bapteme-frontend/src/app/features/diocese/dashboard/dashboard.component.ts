import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // Gardé pour les boutons du tableau
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service'; // Assurez-vous que ce chemin est correct

interface DashboardStats {
  total_paroisses: number;
  total_baptemes: number;
  total_demandes: number;
  demandes_en_attente: number;
  performances_paroisses: ParoissePerformance[];
  evolution_mensuelle: EvolutionMensuelle[];
}

interface ParoissePerformance {
  id: number;
  nom: string;
  demandes_count: number;
  baptemes_count: number;
  delai_moyen?: number;
}

interface EvolutionMensuelle {
  mois: number;
  total: number;
}

@Component({
  selector: 'app-diocese-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CardModule,
    ChartModule,
    TableModule,
    TagModule,
    ButtonModule,
    DropdownModule,
    SkeletonModule,
    TooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);

  stats: DashboardStats | null = null;
  loading = true;

  // Charts
  demandesChartData: any;
  demandesChartOptions: any;
  
  baptemesChartData: any;
  baptemesChartOptions: any;

  // Filters
  selectedYear = new Date().getFullYear();
  years: number[] = [];

  constructor() {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      this.years.push(currentYear - i);
    }
    this.initChartOptions();
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    const params = { year: this.selectedYear };

    this.apiService.get<DashboardStats>('dashboard/diocese', params).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.stats = response.data;
          this.prepareCharts();
        } else {
          this.initializeDefaultStats();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du dashboard:', error);
        this.initializeDefaultStats();
        this.loading = false;
      }
    });
  }

  private initializeDefaultStats(): void {
    this.stats = {
      total_paroisses: 0,
      total_baptemes: 0,
      total_demandes: 0,
      demandes_en_attente: 0,
      performances_paroisses: [],
      evolution_mensuelle: []
    };
    this.prepareCharts();
  }

  prepareCharts(): void {
    if (!this.stats) return;

    const moisLabels = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
      'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
    ];

    const demandesData = new Array(12).fill(0);
    
    if (this.stats.evolution_mensuelle && Array.isArray(this.stats.evolution_mensuelle)) {
      this.stats.evolution_mensuelle.forEach(item => {
        if (item && typeof item.mois === 'number' && typeof item.total === 'number') {
          const moisIndex = item.mois - 1;
          if (moisIndex >= 0 && moisIndex < 12) {
            demandesData[moisIndex] = item.total;
          }
        }
      });
    }

    this.demandesChartData = {
      labels: moisLabels,
      datasets: [
        {
          label: 'Demandes',
          data: demandesData,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }
      ]
    };

    const topParoisses = this.stats.performances_paroisses && Array.isArray(this.stats.performances_paroisses)
      ? this.stats.performances_paroisses.slice(0, 10)
      : [];
    
    const labels = topParoisses.map(p => p?.nom || 'Inconnu');
    const data = topParoisses.map(p => p?.baptemes_count || 0);

    this.baptemesChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Baptêmes',
          data: data,
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(14, 165, 233, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(168, 85, 247, 0.8)'
          ]
        }
      ]
    };
  }

  initChartOptions(): void {
    // Configuration des graphiques (inchangée)
    this.demandesChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (context: any) => {
              return `${context.dataset.label}: ${context.parsed.y}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 10
          }
        }
      }
    };

    this.baptemesChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              return `${context.parsed.x} baptêmes`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true
        }
      }
    };
  }

  onYearChange(): void {
    this.loadDashboard();
  }

  getPerformanceClass(demandes: number): string {
    if (demandes >= 100) return 'excellent';
    if (demandes >= 50) return 'good';
    if (demandes >= 20) return 'average';
    return 'low';
  }

  getPerformanceLabel(demandes: number): string {
    if (demandes >= 100) return 'Excellente';
    if (demandes >= 50) return 'Bonne';
    if (demandes >= 20) return 'Moyenne';
    return 'Faible';
  }

  exportData(): void {
    console.log('Export des données...');
  }
}