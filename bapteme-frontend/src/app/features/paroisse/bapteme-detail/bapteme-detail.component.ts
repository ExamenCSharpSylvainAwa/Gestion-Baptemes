import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { BaptemeService } from '../../../core/services/bapteme.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Bapteme } from '../../../core/models/bapteme.model';

@Component({
  selector: 'app-bapteme-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    DividerModule,
    TagModule,
    SkeletonModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './bapteme-detail.component.html',
  styleUrls: ['./bapteme-detail.component.scss']
})
export class BaptemeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private baptemeService = inject(BaptemeService);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  bapteme: Bapteme | null = null;
  loading = true;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBapteme(parseInt(id));
    }
  }

  loadBapteme(id: number): void {
    this.loading = true;
    this.baptemeService.getById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.bapteme = response.data as Bapteme; 
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Erreur lors du chargement du baptême');
        this.router.navigate(['/paroisse/baptemes']);
      }
    });
  }

  // ✅ CORRECTION: Navigation vers la route d'édition
  editBapteme(): void {
    if (this.bapteme) {
      // Naviguer vers /paroisse/baptemes/:id/edit
      this.router.navigate(['/paroisse/baptemes', this.bapteme.id, 'edit']);
    }
  }

  deleteBapteme(): void {
    if (!this.bapteme) return;

    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer le baptême de ${this.bapteme.prenoms} ${this.bapteme.nom} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (!this.bapteme) return;
        
        this.baptemeService.delete(this.bapteme.id).subscribe({
          next: () => {
            this.notificationService.success('Baptême supprimé avec succès');
            this.router.navigate(['/paroisse/baptemes']);
          },
          error: () => {
            this.notificationService.error('Erreur lors de la suppression');
          }
        });
      }
    });
  }

  getAge(): number | null {
    if (!this.bapteme?.date_naissance) return null;
    
    const today = new Date();
    const birthDate = new Date(this.bapteme.date_naissance);
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 0 ? age : null;
  }
}