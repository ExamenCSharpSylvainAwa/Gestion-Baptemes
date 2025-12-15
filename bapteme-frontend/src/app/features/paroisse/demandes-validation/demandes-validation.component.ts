import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { SkeletonModule } from 'primeng/skeleton';
import { DemandeService } from '../../../core/services/demande.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { DemandeExtrait } from '../../../core/models/demande.model';

@Component({
  selector: 'app-validation-demandes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    DropdownModule,
    TooltipModule,
    BadgeModule,
    SkeletonModule
  ],
  templateUrl: './demandes-validation.component.html',
  styleUrls: ['./demandes-validation.component.scss']
})
export class DemandesValidationComponent implements OnInit {
  private demandeService = inject(DemandeService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  demandes: DemandeExtrait[] = [];
  loading = true;
  totalRecords = 0;
  
  // Pagination
  first = 0;
  rows = 10;
  
  // Filtres
  statutFilter: string | null = null;
  searchTerm = '';

  statutOptions = [
    { label: 'Toutes', value: null },
    { label: 'En attente', value: 'en_attente' },
    { label: 'En cours', value: 'en_cours' },
    { label: 'Validées', value: 'valide' },
    { label: 'Prêtes', value: 'pret' },
    { label: 'Rejetées', value: 'rejete' }
  ];

  // Stats
  stats = {
    en_attente: 0,
    en_cours: 0,
    valides_ce_mois: 0
  };

  ngOnInit(): void {
    this.loadDemandes();
    this.loadStats();
  }

  // ✅ Méthode pour retourner au dashboard
  goBack(): void {
    this.router.navigate(['/paroisse/dashboard']);
  }

  loadDemandes(event?: any): void {
    this.loading = true;

    const params: any = {
      page: event ? Math.floor(event.first / event.rows) + 1 : 1,
      per_page: this.rows,
      paroisse_id: this.authService.currentUser()?.paroisse_id
    };

    if (this.statutFilter) {
      params.statut = this.statutFilter;
    }

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    this.demandeService.getAll(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.demandes = response.data.data;
          this.totalRecords = response.data.total;
          this.updateStats();
        }
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur chargement demandes:', error);
        this.notificationService.error('Erreur lors du chargement des demandes');
      }
    });
  }

  loadStats(): void {
    this.demandeService.getAll({ 
      paroisse_id: this.authService.currentUser()?.paroisse_id,
      per_page: 1000
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.updateStatsFromData(response.data.data);
        }
      },
      error: (error) => {
        console.error('Erreur chargement stats:', error);
      }
    });
  }

  updateStats(): void {
    this.stats = {
      en_attente: this.demandes.filter(d => d.statut === 'en_attente').length,
      en_cours: this.demandes.filter(d => d.statut === 'en_cours').length,
      valides_ce_mois: this.demandes.filter(d => {
        const now = new Date();
        const demandeDate = new Date(d.created_at);
        return (d.statut === 'valide' || d.statut === 'pret') && 
               demandeDate.getMonth() === now.getMonth() &&
               demandeDate.getFullYear() === now.getFullYear();
      }).length
    };
  }

  updateStatsFromData(demandes: DemandeExtrait[]): void {
    const now = new Date();
    this.stats = {
      en_attente: demandes.filter(d => d.statut === 'en_attente').length,
      en_cours: demandes.filter(d => d.statut === 'en_cours').length,
      valides_ce_mois: demandes.filter(d => {
        const demandeDate = new Date(d.created_at);
        return (d.statut === 'valide' || d.statut === 'pret') && 
               demandeDate.getMonth() === now.getMonth() &&
               demandeDate.getFullYear() === now.getFullYear();
      }).length
    };
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.loadDemandes(event);
  }

  onFilter(): void {
    this.first = 0;
    this.loadDemandes();
  }

  resetFilters(): void {
    this.statutFilter = null;
    this.searchTerm = '';
    this.onFilter();
  }

  processRequest(demande: DemandeExtrait): void {
    console.log('🔄 Traitement de la demande:', demande.id);
    
    if (!demande.id) {
      this.notificationService.error('ID de demande invalide');
      return;
    }

    this.router.navigate(['/paroisse/demandes', demande.id])
      .then(success => {
        if (success) {
          console.log('✅ Navigation réussie vers demande', demande.id);
        } else {
          console.error('❌ Échec de navigation vers demande', demande.id);
          this.notificationService.error('Erreur lors de l\'ouverture de la demande');
        }
      })
      .catch(error => {
        console.error('❌ Erreur navigation:', error);
        this.notificationService.error('Erreur lors de l\'ouverture de la demande');
      });
  }

  viewDetails(demande: DemandeExtrait): void {
    console.log('👁️ Affichage détails demande:', demande.id);
    
    if (!demande.id) {
      this.notificationService.error('ID de demande invalide');
      return;
    }

    this.router.navigate(['/paroisse/demandes', demande.id])
      .then(success => {
        if (success) {
          console.log('✅ Navigation réussie vers détails', demande.id);
        } else {
          console.error('❌ Échec de navigation vers détails', demande.id);
          this.notificationService.error('Erreur lors de l\'ouverture des détails');
        }
      })
      .catch(error => {
        console.error('❌ Erreur navigation:', error);
        this.notificationService.error('Erreur lors de l\'ouverture des détails');
      });
  }

  getStatutSeverity(statut: string): string {
    const severities: { [key: string]: string } = {
      'en_attente': 'warning',
      'en_cours': 'info',
      'valide': 'success',
      'pret': 'success',
      'rejete': 'danger'
    };
    return severities[statut] || 'secondary';
  }

  getPriorityClass(demande: DemandeExtrait): string {
    const daysSinceCreation = Math.floor(
      (new Date().getTime() - new Date(demande.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceCreation > 3 && demande.statut === 'en_attente') {
      return 'priority-high';
    } else if (daysSinceCreation > 1 && demande.statut === 'en_attente') {
      return 'priority-medium';
    }
    return '';
  }

  canProcess(demande: DemandeExtrait): boolean {
    return demande.statut === 'en_attente' || demande.statut === 'en_cours';
  }

  isPaid(demande: DemandeExtrait): boolean {
    return demande.paiement?.statut === 'succes';
  }
}