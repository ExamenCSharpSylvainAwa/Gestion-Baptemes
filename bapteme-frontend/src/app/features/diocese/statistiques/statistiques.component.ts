import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag'; 
import { TooltipModule } from 'primeng/tooltip'; 
import { ApiService } from '../../../core/services/api.service';

// Interface pour les données de la table Paroisse
interface ParoisseDetail {
  nom: string;
  mission: string;
  baptemes: number;
  demandes: number;
  delai: number;
  performance: string;
}

// Interface pour les rapports disponibles
interface Rapport {
  nom: string;
  type: string;
  date: string;
  taille: string;
  icon: string;
}

// Interface générique des données statistiques
interface StatsData {
  baptemes_par_mois: any[];
  baptemes_par_paroisse: any[];
  baptemes_par_sexe: any;
  demandes_par_statut: any;
  evolution_annuelle: any[];
  details_paroisse: ParoisseDetail[]; 
}

// 🚨 CORRECTION D'ERREUR 2322: Définition du Type Union pour la propriété 'severity' de p-tag
type SeverityType = 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined;

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ChartModule,
    DropdownModule,
    ButtonModule,
    TabViewModule,
    TableModule,
    SkeletonModule,
    TagModule, 
    TooltipModule 
  ],
  templateUrl: './statistiques.component.html',
  styleUrls: ['./statistiques.component.scss']
})
export class StatistiquesComponent implements OnInit {
  // Remplacez par inject(ApiService) si le service existe et est complet
  // private apiService = inject(ApiService); 
  
  loading = true;
  selectedYear = new Date().getFullYear();
  years: number[] = [];
  
  detailsParoisses: ParoisseDetail[] = [];

  // Données statiques pour le formulaire de rapport
  typesRapport = [
    { label: 'Rapport Annuel Diocésain', value: 'annual' },
    { label: 'Rapport Mensuel Détaillé', value: 'monthly' },
    { label: 'Performance par Paroisse', value: 'parish' }
  ];
  periodes = [
    { label: 'Année Complète', value: 'year' },
    { label: 'Trimestre 1', value: 'q1' },
    { label: 'Trimestre 2', value: 'q2' }
  ];
  formats = [
    { label: 'PDF', value: 'pdf' },
    { label: 'Excel (XLSX)', value: 'xlsx' }
  ];
  rapportsDisponibles: Rapport[] = [
    { nom: 'Rapport Annuel ' + (new Date().getFullYear() - 1), type: 'PDF', date: '01/01/' + (new Date().getFullYear()), taille: '1.2 Mo', icon: 'pi-file-pdf' },
    { nom: 'Synthèse des Baptêmes T3', type: 'XLSX', date: '30/09/' + new Date().getFullYear(), taille: '450 Ko', icon: 'pi-file-excel' },
    { nom: 'Demandes Rejetées (Mensuel)', type: 'PDF', date: '01/11/' + new Date().getFullYear(), taille: '80 Ko', icon: 'pi-file-o' }
  ];


  // Charts Data
  baptemesMoisChart: any;
  baptemesParoisseChart: any;
  baptemesSexeChart: any;
  demandesStatutChart: any;
  evolutionAnnuelleChart: any;
  comparaisonMensuelleChart: any; 

  // Chart Options
  chartOptions: any;
  pieChartOptions: any;
  barChartOptions: any;

  constructor() {
    // Générer années
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 10; i++) {
      this.years.push(currentYear - i);
    }

    this.initChartOptions();
  }

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;
    
    // Simuler les données (REMPLACER PAR L'APPEL API RÉEL)
    setTimeout(() => {
      this.prepareCharts();
      this.loading = false;
    }, 1000);
  }

  prepareCharts(): void {
    const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    // 1. Baptêmes par mois
    this.baptemesMoisChart = {
      labels: moisLabels,
      datasets: [
        {
          label: 'Baptêmes',
          data: [65, 59, 80, 81, 56, 55, 70, 85, 75, 90, 88, 95],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }
      ]
    };

    // 2. Baptêmes par paroisse (Top 15)
    this.baptemesParoisseChart = {
      labels: [
        'Cathédrale', 'Sacré-Cœur', 'St-Pierre', 'St-Charles', 'Notre-Dame',
        'St-Joseph', 'Immaculée', 'St-Michel', 'St-Jean', 'Ste-Anne',
        'St-Paul', 'St-Marc', 'St-Luc', 'St-Matthieu', 'Ste-Marie'
      ],
      datasets: [
        {
          label: 'Baptêmes',
          data: [145, 132, 128, 115, 108, 95, 87, 82, 75, 68, 62, 58, 52, 48, 45],
          backgroundColor: [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
            '#6366f1', '#a855f7', '#f43f5e', '#22d3ee', '#eab308'
          ]
        }
      ]
    };

    // 3. Baptêmes par sexe
    this.baptemesSexeChart = {
      labels: ['Masculin', 'Féminin'],
      datasets: [
        {
          data: [520, 480],
          backgroundColor: ['#3b82f6', '#ec4899'],
          hoverBackgroundColor: ['#2563eb', '#db2777']
        }
      ]
    };

    // 4. Demandes par statut
    this.demandesStatutChart = {
      labels: ['En attente', 'En cours', 'Validées', 'Prêtes', 'Rejetées'],
      datasets: [
        {
          data: [45, 28, 85, 120, 12],
          backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#059669', '#ef4444']
        }
      ]
    };

    // 5. Évolution annuelle
    const currentYear = this.selectedYear;
    this.evolutionAnnuelleChart = {
      labels: [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear],
      datasets: [
        {
          label: 'Baptêmes',
          data: [850, 920, 980, 1050, 1000],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          tension: 0.4
        },
        {
          label: 'Demandes',
          data: [720, 780, 850, 920, 890],
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
          tension: 0.4
        }
      ]
    };

    // 6. Comparaison Mensuelle
    this.comparaisonMensuelleChart = {
        labels: moisLabels,
        datasets: [
            {
                label: this.selectedYear.toString(),
                backgroundColor: '#3b82f6',
                data: [65, 59, 80, 81, 56, 55, 70, 85, 75, 90, 88, 95]
            },
            {
                label: (this.selectedYear - 1).toString(),
                backgroundColor: '#10b981',
                data: [58, 62, 75, 70, 60, 48, 65, 78, 80, 85, 92, 98]
            }
        ]
    };

    // 7. Détails par paroisse
    this.detailsParoisses = [
        { nom: 'Cathédrale', mission: 'St-Louis', baptemes: 145, demandes: 150, delai: 12, performance: 'Excellent' },
        { nom: 'Sacré-Cœur', mission: 'St-Joseph', baptemes: 132, demandes: 140, delai: 18, performance: 'Bon' },
        { nom: 'St-Pierre', mission: 'St-Paul', baptemes: 128, demandes: 135, delai: 24, performance: 'Moyen' },
        { nom: 'St-Charles', mission: 'Ste-Thérèse', baptemes: 115, demandes: 120, delai: 36, performance: 'À améliorer' },
        { nom: 'Notre-Dame', mission: 'St-Jean', baptemes: 108, demandes: 115, delai: 20, performance: 'Bon' },
        { nom: 'St-Joseph', mission: 'St-Michel', baptemes: 95, demandes: 100, delai: 48, performance: 'Mauvais' },
        { nom: 'Immaculée', mission: 'Ste-Croix', baptemes: 87, demandes: 90, delai: 22, performance: 'Bon' },
        { nom: 'St-Michel', mission: 'St-Antoine', baptemes: 82, demandes: 85, delai: 15, performance: 'Excellent' },
        { nom: 'St-Jean', mission: 'St-Matthieu', baptemes: 75, demandes: 78, delai: 30, performance: 'Moyen' },
        { nom: 'Ste-Anne', mission: 'Ste-Claire', baptemes: 68, demandes: 70, delai: 55, performance: 'Mauvais' },
    ];
  }

  initChartOptions(): void {
    // Options des graphiques Line et Bar (pour l'évolution annuelle et mensuelle)
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
          beginAtZero: true
        }
      }
    };

    // Options des graphiques Pie et Doughnut (pour la répartition par sexe/statut)
    this.pieChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };

    // Options du graphique Bar Horizontal (pour les paroisses)
    this.barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y', // Rendre les barres horizontales
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: true
        }
      }
    };
  }

  // 🚨 CORRECTION D'ERREUR 2322: La méthode renvoie maintenant le type 'SeverityType'
  getPerformanceSeverity(performance: string): SeverityType {
    switch (performance) {
      case 'Excellent':
        return 'success';
      case 'Bon':
        return 'info';
      case 'Moyen':
        return 'warning';
      case 'À améliorer':
        return 'danger';
      case 'Mauvais':
        return 'secondary';
      default:
        return 'info';
    }
  }

  onYearChange(): void {
    this.loadStatistics();
  }

  exportPDF(): void {
    console.log('Export PDF pour l\'année', this.selectedYear);
  }

  exportExcel(): void {
    console.log('Export Excel pour l\'année', this.selectedYear);
  }
}