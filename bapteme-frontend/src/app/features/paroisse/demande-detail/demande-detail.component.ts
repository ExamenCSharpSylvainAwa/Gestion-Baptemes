import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // ✅ Ajout de RouterModule
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { DemandeService } from '../../../core/services/demande.service';
import { BaptemeService } from '../../../core/services/bapteme.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DemandeExtrait } from '../../../core/models/demande.model';
import { Bapteme } from '../../../core/models/bapteme.model';

@Component({
  selector: 'app-demande-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule, // ✅ Ajout ici
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    InputTextareaModule,
    RadioButtonModule,
    DialogModule,
    TableModule,
    SkeletonModule,
    MessagesModule,
    MessageModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [ConfirmationService],
  templateUrl: './demande-detail.component.html',
  styleUrls: ['./demande-detail.component.scss']
})
export class DemandeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private demandeService = inject(DemandeService);
  private baptemeService = inject(BaptemeService);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  demande: DemandeExtrait | null = null;
  loading = true;

  // Recherche de baptêmes
  baptemesRecherche: Bapteme[] = [];
  searchingBaptemes = false;
  showSearchResults = false;

  // Sélection du baptême
  selectedBapteme: Bapteme | null = null;
  showBaptemeDialog = false;

  // Validation/Rejet
  showValidationDialog = false;
  showRejetDialog = false;
  validationForm: FormGroup;
  rejetForm: FormGroup;
  processing = false;

  constructor() {
    this.validationForm = this.fb.group({
      bapteme_id: [null, Validators.required]
    });

    this.rejetForm = this.fb.group({
      motif_rejet: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDemande(parseInt(id));
    }
  }

  loadDemande(id: number): void {
    this.loading = true;
    this.demandeService.getById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.demande = response.data;
          // Auto-recherche au chargement
          this.searchBaptemes();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Erreur lors du chargement de la demande');
        this.router.navigate(['/paroisse/demandes']);
      }
    });
  }

  searchBaptemes(): void {
    if (!this.demande) return;

    this.searchingBaptemes = true;
    this.showSearchResults = false;

    const searchParams = {
      prenoms: this.demande.prenoms_recherche,
      nom: this.demande.nom_recherche,
      date_naissance: this.demande.date_naissance_recherche || null,
      paroisse_id: this.demande.paroisse?.id
    };

    this.baptemeService.search(searchParams).subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) { 
          this.baptemesRecherche = response.data;
          this.showSearchResults = true;

          if (this.baptemesRecherche.length === 0) {
            this.notificationService.warning('Aucun baptême trouvé avec ces critères');
          } else {
            this.notificationService.success(
              `${this.baptemesRecherche.length} baptême(s) trouvé(s)`
            );
          }
        }
        this.searchingBaptemes = false;
      },
      error: () => {
        this.searchingBaptemes = false;
        this.notificationService.error('Erreur lors de la recherche');
      }
    });
  }

  selectBapteme(bapteme: Bapteme): void {
    this.selectedBapteme = bapteme;
    this.showBaptemeDialog = true;
  }

  confirmBaptemeSelection(): void {
    if (!this.selectedBapteme) return;
    
    this.validationForm.patchValue({
      bapteme_id: this.selectedBapteme.id
    });

    this.showBaptemeDialog = false;
    this.showValidationDialog = true;
  }

  validerDemande(): void {
    if (this.validationForm.invalid || !this.demande) {
      this.notificationService.warning('Veuillez sélectionner un baptême');
      return;
    }

    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir valider cette demande ? Un extrait sera généré automatiquement.',
      header: 'Confirmation de validation',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Oui, valider',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.processing = true;

        const data = {
          action: 'valider',
          bapteme_id: this.validationForm.value.bapteme_id
        };

        this.demandeService.traiter(this.demande!.id, data).subscribe({
          next: (response) => {
            if (response.success) {
              this.notificationService.success('Demande validée avec succès ! Extrait généré.');
              this.showValidationDialog = false;
              this.router.navigate(['/paroisse/demandes']);
            }
            this.processing = false;
          },
          error: () => {
            this.processing = false;
            this.notificationService.error('Erreur lors de la validation');
          }
        });
      }
    });
  }

  rejeterDemande(): void {
    if (this.rejetForm.invalid) {
      this.rejetForm.markAllAsTouched();
      return;
    }

    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir rejeter cette demande ? Le demandeur sera notifié.',
      header: 'Confirmation de rejet',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, rejeter',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.processing = true;

        const data = {
          action: 'rejeter',
          motif_rejet: this.rejetForm.value.motif_rejet
        };

        this.demandeService.traiter(this.demande!.id, data).subscribe({
          next: (response) => {
            if (response.success) {
              this.notificationService.success('Demande rejetée');
              this.showRejetDialog = false;
              this.router.navigate(['/paroisse/demandes']);
            }
            this.processing = false;
          },
          error: () => {
            this.processing = false;
            this.notificationService.error('Erreur lors du rejet');
          }
        });
      }
    });
  }

  getStatutSeverity(statut: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const severities: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'secondary'> = {
      'en_attente': 'warning',
      'en_cours': 'info',
      'valide': 'success',
      'pret': 'success',
      'rejete': 'danger'
    };
    return severities[statut] || 'secondary';
  }

  canProcess(): boolean {
    if (!this.demande) return false;
    return this.demande.statut === 'en_attente' || this.demande.statut === 'en_cours';
  }

  isPaid(): boolean {
    if (!this.demande) return false;
    return this.demande.paiement?.statut === 'succes';
  }

  getMethodeLabel(methode: string | undefined): string {
    if (!methode) return 'N/A';
    
    const labels: Record<string, string> = {
      'wave': 'Wave',
      'orange_money': 'Orange Money',
      'free_money': 'Free Money',
      'carte': 'Carte bancaire'
    };
    return labels[methode] || methode;
  }

  getMatchScore(bapteme: Bapteme): number {
    if (!this.demande) return 0;

    let score = 0;
    
    // Nom exact = 30 points
    if (bapteme.nom.toLowerCase() === this.demande.nom_recherche.toLowerCase()) {
      score += 30;
    }
    
    // Prénom contient = 30 points
    if (bapteme.prenoms.toLowerCase().includes(this.demande.prenoms_recherche.toLowerCase())) {
      score += 30;
    }
    
    // Date naissance = 40 points
    if (this.demande.date_naissance_recherche && 
        bapteme.date_naissance === this.demande.date_naissance_recherche) {
      score += 40;
    }

    return score;
  }

  get motif_rejet() {
    return this.rejetForm.get('motif_rejet');
  }
}