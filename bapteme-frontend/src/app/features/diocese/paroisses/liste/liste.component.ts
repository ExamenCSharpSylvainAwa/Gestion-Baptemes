import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AvatarModule } from 'primeng/avatar';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ConfirmationService } from 'primeng/api';
import { ApiService } from '../../../../core/services/api.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Paroisse } from '../../../../core/models/user.model';

interface ParoisseStatistics {
  total_baptemes: number;
  total_parrains: number;
  total_marraines: number;
  baptemes_par_mois?: { mois: string; count: number }[];
  baptemes_recents?: any[];
}

interface ParoisseForm {
  nom: string;
  mission: string;
  bp: string;
  telephone: string;
  email: string;
  adresse: string;
  diocese_id?: number;
}

@Component({
  selector: 'app-paroisses-liste',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    DialogModule,
    TooltipModule,
    ConfirmDialogModule,
    AvatarModule,
    SkeletonModule,
    ProgressSpinnerModule,
    DropdownModule,
    InputTextareaModule
  ],
  providers: [ConfirmationService],
  templateUrl: './liste.component.html',
  styleUrls: ['./liste.component.scss']
})
export class ListeComponent implements OnInit {
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  paroisses: Paroisse[] = [];
  selectedParoisse: Paroisse | null = null;
  statistics: ParoisseStatistics | null = null;
  loading = true;
  loadingStats = false;
  searchTerm = '';
  
  showDetailsDialog = false;
  showStatsDialog = false;
  showFormDialog = false;
  isEditMode = false;
  savingParoisse = false;

  paroisseForm: ParoisseForm = {
    nom: '',
    mission: '',
    bp: '',
    telephone: '',
    email: '',
    adresse: ''
  };

  ngOnInit(): void {
    this.loadParoisses();
  }

  loadParoisses(): void {
    this.loading = true;
    this.apiService.get<Paroisse[]>('paroisses').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.paroisses = response.data;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Erreur lors du chargement des paroisses');
      }
    });
  }

  viewDetails(paroisse: Paroisse): void {
    this.selectedParoisse = paroisse;
    this.showDetailsDialog = true;
  }

  getStatistics(paroisseId: number): void {
    const paroisse = this.paroisses.find(p => p.id === paroisseId);
    if (paroisse) {
      this.selectedParoisse = paroisse;
    }

    this.loadingStats = true;
    this.showStatsDialog = true;
    this.statistics = null;

    this.apiService.get<ParoisseStatistics>(`paroisses/${paroisseId}/statistics`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.statistics = response.data;
        }
        this.loadingStats = false;
      },
      error: () => {
        this.loadingStats = false;
        this.notificationService.error('Erreur lors du chargement des statistiques');
        this.showStatsDialog = false;
      }
    });
  }

  openNewParoisseDialog(): void {
    this.isEditMode = false;
    this.selectedParoisse = null;
    this.resetForm();
    this.showFormDialog = true;
  }

  openEditParoisseDialog(paroisse: Paroisse): void {
    this.isEditMode = true;
    this.selectedParoisse = paroisse;
    this.paroisseForm = {
      nom: paroisse.nom || '',
      mission: paroisse.mission || '',
      bp: paroisse.bp || '',
      telephone: paroisse.telephone || '',
      email: paroisse.email || '',
      adresse: paroisse.adresse || '',
      diocese_id: paroisse.diocese?.id
    };
    this.showFormDialog = true;
  }

  saveParoisse(): void {
    if (!this.paroisseForm.nom.trim()) {
      this.notificationService.error('Le nom de la paroisse est requis');
      return;
    }

    this.savingParoisse = true;

    if (this.isEditMode && this.selectedParoisse) {
      // Mode édition
      this.apiService.put(`paroisses/${this.selectedParoisse.id}`, this.paroisseForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success('Paroisse modifiée avec succès');
            this.loadParoisses();
            this.closeFormDialog();
          }
          this.savingParoisse = false;
        },
        error: () => {
          this.savingParoisse = false;
          this.notificationService.error('Erreur lors de la modification de la paroisse');
        }
      });
    } else {
      // Mode création
      this.apiService.post('paroisses', this.paroisseForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success('Paroisse créée avec succès');
            this.loadParoisses();
            this.closeFormDialog();
          }
          this.savingParoisse = false;
        },
        error: () => {
          this.savingParoisse = false;
          this.notificationService.error('Erreur lors de la création de la paroisse');
        }
      });
    }
  }

  closeFormDialog(): void {
    this.showFormDialog = false;
    this.resetForm();
    this.selectedParoisse = null;
    this.isEditMode = false;
  }

  closeStatsDialog(): void {
    this.showStatsDialog = false;
    this.statistics = null;
    this.loadingStats = false;
  }

  resetForm(): void {
    this.paroisseForm = {
      nom: '',
      mission: '',
      bp: '',
      telephone: '',
      email: '',
      adresse: ''
    };
  }

  exportData(): void {
    this.notificationService.info('Export en cours de développement...');
  }

  get filteredParoisses(): Paroisse[] {
    if (!this.searchTerm) {
      return this.paroisses;
    }
    
    return this.paroisses.filter(p => 
      p.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      p.mission?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      p.adresse?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}