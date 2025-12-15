import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

type TagSeverity = 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast';

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
    ChartModule,
    NavbarComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  loading = true;
  stats: any = {};
  dernieresDemandes: any[] = [];
  chartData: any;
  chartOptions: any;

  ngOnInit(): void {
    this.loadDashboard();
    this.setupChart();
  }

  loadDashboard(): void {
    this.loading = true;
    this.apiService.get<any>('dashboard/paroisse').subscribe({
      next: (response) => {
        this.stats = response.data;
        this.dernieresDemandes = response.data?.dernieres_demandes || [];
        
        // ✅ Mettre à jour le graphique avec les vraies données
        if (response.data?.baptemes_par_mois) {
          this.updateChartWithRealData(response.data.baptemes_par_mois);
        }
        
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  setupChart(): void {
    // Configuration initiale du graphique (sera mise à jour avec les vraies données)
    const documentStyle = getComputedStyle(document.documentElement);
    
    this.chartData = {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
      datasets: [
        {
          label: 'Baptêmes',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Données initiales vides
          backgroundColor: 'rgba(30, 64, 175, 0.1)',
          borderColor: 'rgba(30, 64, 175, 1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgba(30, 64, 175, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: 'rgba(30, 64, 175, 1)',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#1e293b',
            font: {
              size: 13,
              weight: 600
            },
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(30, 64, 175, 0.5)',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context: any) {
              return ' Baptêmes: ' + context.parsed.y;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#64748b',
            font: {
              size: 12,
              weight: 500
            }
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#64748b',
            font: {
              size: 12,
              weight: 500
            },
            stepSize: 1, // Pour avoir des nombres entiers
            callback: function(value: any) {
              return Number.isInteger(value) ? value : '';
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
            drawBorder: false
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    };
  }

  /**
   * ✅ MÉTHODE CORRIGÉE - Met à jour le graphique avec les vraies données de l'API
   */
  updateChartWithRealData(baptemesParMois: any): void {
    console.log('📊 Données reçues baptemesParMois:', baptemesParMois);
    
    // baptemesParMois est un objet avec les mois comme clés: { "1": 12, "2": 19, ... }
    // ou un tableau: [12, 19, 15, ...]
    
    const monthlyData = new Array(12).fill(0);
    
    if (Array.isArray(baptemesParMois)) {
      // Si c'est un tableau [12, 19, 15, ...]
      baptemesParMois.forEach((count, index) => {
        if (index < 12) {
          monthlyData[index] = count || 0;
        }
      });
    } else if (typeof baptemesParMois === 'object' && baptemesParMois !== null) {
      // Si c'est un objet { "1": 12, "2": 19, ... }
      Object.keys(baptemesParMois).forEach(month => {
        const monthIndex = parseInt(month) - 1; // Mois de 1-12 → index 0-11
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyData[monthIndex] = parseInt(baptemesParMois[month]) || 0;
        }
      });
    }

    console.log('📈 Données graphique mises à jour:', monthlyData);

    // Mettre à jour les données du graphique
    this.chartData = {
      ...this.chartData,
      datasets: [{
        ...this.chartData.datasets[0],
        data: monthlyData
      }]
    };
  }

  getStatutSeverity(statut: string): TagSeverity {
    const severityMap: Record<string, TagSeverity> = {
      'en_attente': 'warning',
      'en_cours': 'info',
      'valide': 'success',
      'pret': 'success',
      'rejete': 'danger'
    };
    return severityMap[statut] || 'info';
  }
}