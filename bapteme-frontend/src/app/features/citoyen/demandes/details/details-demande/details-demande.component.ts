import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TimelineModule } from 'primeng/timeline';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { DemandeService } from '../../../../../core/services/demande.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DemandeExtrait } from '../../../../../core/models/demande.model';

interface TimelineEvent {
  status: string;
  date: string;
  icon: string;
  color: string;
}

// ✅ TYPE CORRIGÉ - suppression de null et utilisation de "warning" au lieu de "warn"
type SeverityType = "success" | "secondary" | "info" | "warning" | "danger" | "contrast";

@Component({
  selector: 'app-details-demande',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    TimelineModule,
    DialogModule,
    RadioButtonModule,
    InputTextModule,
    InputMaskModule,
    SkeletonModule,
    MessageModule,
    TooltipModule
  ],
  templateUrl: './details-demande.component.html',
  styleUrls: ['./details-demande.component.scss']
})
export class DetailsDemandeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private demandeService = inject(DemandeService);
  private notificationService = inject(NotificationService);

  demande: DemandeExtrait | null = null;
  loading = true;
  
  // Paiement Dialog
  showPaiementDialog = false;
  paiementForm: FormGroup;
  processingPayment = false;

  methodePaiement = [
    { 
      label: 'Wave', 
      value: 'wave', 
      icon: 'pi pi-mobile',
      description: 'Paiement rapide et sécurisé'
    },
    { 
      label: 'Orange Money', 
      value: 'orange_money', 
      icon: 'pi pi-wallet',
      description: 'Paiement par Orange Money'
    },
    { 
      label: 'Free Money', 
      value: 'free_money', 
      icon: 'pi pi-credit-card',
      description: 'Paiement par Free Money'
    }
  ];

  timelineEvents: TimelineEvent[] = [];

  constructor() {
    this.paiementForm = this.fb.group({
      methode: ['wave', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern(/^7[0-9]{8}$/)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDemande(parseInt(id));
    }

    // Vérifier si on doit ouvrir le dialog de paiement
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'payer') {
        setTimeout(() => {
          this.openPaiementDialog();
        }, 500);
      }
    });
  }

  loadDemande(id: number): void {
    this.loading = true;
    this.demandeService.getById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.demande = response.data;
          this.buildTimeline();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Erreur lors du chargement de la demande');
        this.router.navigate(['/citoyen/demandes']);
      }
    });
  }

  buildTimeline(): void {
    if (!this.demande) return;

    this.timelineEvents = [
      {
        status: 'Demande créée',
        date: this.demande.created_at,
        icon: 'pi pi-plus-circle',
        color: '#3b82f6'
      }
    ];

    if (this.demande.paiement?.statut === 'succes') {
      this.timelineEvents.push({
        status: 'Paiement effectué',
        date: this.demande.paiement.reference || this.demande.updated_at,
        icon: 'pi pi-check-circle',
        color: '#10b981'
      });
    }

    if (this.demande.statut === 'valide' || this.demande.statut === 'pret') {
      this.timelineEvents.push({
        status: 'Demande validée',
        date: this.demande.updated_at,
        icon: 'pi pi-verified',
        color: '#10b981'
      });
    }

    if (this.demande.statut === 'pret') {
      this.timelineEvents.push({
        status: 'Extrait généré',
        date: this.demande.extrait?.date_generation || this.demande.updated_at,
        icon: 'pi pi-file-pdf',
        color: '#059669'
      });
    }

    if (this.demande.statut === 'rejete') {
      this.timelineEvents.push({
        status: 'Demande rejetée',
        date: this.demande.updated_at,
        icon: 'pi pi-times-circle',
        color: '#dc2626'
      });
    }
  }

  openPaiementDialog(): void {
    if (!this.canPay()) {
      this.notificationService.warning('Le paiement n\'est pas disponible pour cette demande');
      return;
    }
    this.showPaiementDialog = true;
  }

  submitPaiement(): void {
    if (this.paiementForm.invalid || !this.demande) {
      this.paiementForm.markAllAsTouched();
      return;
    }

    this.processingPayment = true;

    const formData = {
      methode: this.paiementForm.value.methode,
      telephone: '+221' + this.paiementForm.value.telephone
    };

    this.demandeService.initierPaiement(this.demande.id, formData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.notificationService.success('Paiement initié avec succès');
          
          // Rediriger vers l'URL de paiement si disponible
          if (response.data.checkout_url) {
            window.open(response.data.checkout_url, '_blank');
          }
          
          this.showPaiementDialog = false;
          this.processingPayment = false;
          
          // Recharger la demande après 3 secondes
          setTimeout(() => {
            if (this.demande) {
              this.loadDemande(this.demande.id);
            }
          }, 3000);
        }
      },
      error: () => {
        this.processingPayment = false;
        this.notificationService.error('Erreur lors de l\'initiation du paiement');
      }
    });
  }

  
telechargerExtrait(): void {
  if (!this.demande || !this.demande.extrait) {
    this.notificationService.warning('Aucun extrait disponible');
    return;
  }

  console.log('Début téléchargement pour demande:', this.demande.id);
  this.notificationService.info('Téléchargement en cours...');

  this.demandeService.telechargerExtrait(this.demande.id).subscribe({
    next: (blob: Blob) => {
      console.log('Blob reçu, taille:', blob.size);
      
      // Vérifier que le blob est un PDF
      if (blob.type !== 'application/pdf') {
        console.error('Type de fichier incorrect:', blob.type);
        this.notificationService.error('Le fichier reçu n\'est pas un PDF');
        return;
      }

      // Créer l'URL du blob
      const url = window.URL.createObjectURL(blob);
      
      // Créer un lien temporaire
      const link = document.createElement('a');
      link.href = url;
      link.download = `extrait_bapteme_${this.demande?.extrait?.numero_unique || 'document'}.pdf`;
      link.style.display = 'none';
      
      // Ajouter au DOM, cliquer, puis supprimer
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer après un court délai
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('Téléchargement terminé et nettoyé');
      }, 100);
      
      this.notificationService.success('Téléchargement réussi');
    },
    error: (error) => {
      console.error('Erreur lors du téléchargement:', error);
      console.error('Statut:', error.status);
      console.error('Message:', error.message);
      
      if (error.status === 401) {
        this.notificationService.error('Session expirée. Veuillez vous reconnecter.');
        this.router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        this.notificationService.error('Vous n\'êtes pas autorisé à télécharger cet extrait');
      } else if (error.status === 404) {
        this.notificationService.error('Extrait non trouvé');
      } else {
        this.notificationService.error('Erreur lors du téléchargement');
      }
    }
  });
}

  // ✅ MÉTHODE CORRIGÉE - utilisation de "warning" au lieu de "warn"
  getStatutSeverity(statut: string): SeverityType {
    const severities: Record<string, SeverityType> = {
      'en_attente': 'warning',    // ✅ CHANGÉ: 'warn' → 'warning'
      'en_cours': 'info',
      'valide': 'success',
      'pret': 'success',
      'rejete': 'danger'
    };
    return severities[statut] || 'secondary';
  }

  canPay(): boolean {
    if (!this.demande) return false;
    return this.demande.statut === 'en_attente' && 
           (!this.demande.paiement || this.demande.paiement.statut !== 'succes');
  }

  canDownload(): boolean {
    if (!this.demande) return false;
    return this.demande.statut === 'pret' && !!this.demande.extrait;
  }

  isPaid(): boolean {
    if (!this.demande) return false;
    return this.demande.paiement?.statut === 'succes';
  }

  getMethodeLabel(methode: string | undefined): string {
    if (!methode) return 'Non spécifié';
    const method = this.methodePaiement.find(m => m.value === methode);
    return method?.label || methode;
  }

  get methode() {
    return this.paiementForm.get('methode');
  }

  get telephone() {
    return this.paiementForm.get('telephone');
  }
}