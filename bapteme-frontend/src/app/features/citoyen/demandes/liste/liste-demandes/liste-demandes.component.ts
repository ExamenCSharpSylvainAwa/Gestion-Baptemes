import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { DemandeService } from '../../../../../core/services/demande.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DemandeExtrait } from '../../../../../core/models/demande.model';

// ✅ Type corrigé
type TagSeverity = "success" | "secondary" | "info" | "warning" | "danger" | "contrast";

@Component({
  selector: 'app-liste-demandes',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    DropdownModule,
    SkeletonModule,
    TooltipModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './liste-demandes.component.html',
  styleUrls: ['./liste-demandes.component.scss']
})
export class ListeDemandesComponent implements OnInit {
  private demandeService = inject(DemandeService);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

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
    { label: 'Tous', value: null },
    { label: 'En attente', value: 'en_attente' },
    { label: 'En cours', value: 'en_cours' },
    { label: 'Validée', value: 'valide' },
    { label: 'Prêt', value: 'pret' },
    { label: 'Rejeté', value: 'rejete' }
  ];

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(event?: any): void {
    this.loading = true;

    const params: any = {
      page: event ? Math.floor(event.first / event.rows) + 1 : 1,
      per_page: this.rows
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
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Erreur lors du chargement des demandes');
      }
    });
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

  telechargerExtrait(demande: DemandeExtrait): void {
    if (!demande.extrait) {
      this.notificationService.warning('Aucun extrait disponible');
      return;
    }

    this.demandeService.telecharger(demande.id).subscribe({
      next: (response) => {
        if (response.success && response.data?.url) {
          window.open(response.data.url, '_blank');
          this.notificationService.success('Téléchargement démarré');
        }
      },
      error: () => {
        this.notificationService.error('Erreur lors du téléchargement');
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

  canDownload(demande: DemandeExtrait): boolean {
    return demande.statut === 'pret' && !!demande.extrait;
  }

  canPay(demande: DemandeExtrait): boolean {
    return demande.statut === 'en_attente' && 
           (!demande.paiement || demande.paiement.statut !== 'succes');
  }
}