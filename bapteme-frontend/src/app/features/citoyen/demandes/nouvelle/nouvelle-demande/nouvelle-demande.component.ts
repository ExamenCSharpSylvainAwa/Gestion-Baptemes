import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StepsModule } from 'primeng/steps';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { MenuItem } from 'primeng/api';
import { DemandeService } from '../../../../../core/services/demande.service';
import { ApiService } from '../../../../../core/services/api.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { Paroisse } from '../../../../../core/models/user.model';

@Component({
  selector: 'app-nouvelle-demande',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StepsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    DividerModule,
    MessageModule
],
  templateUrl: './nouvelle-demande.component.html',
  styleUrls: ['./nouvelle-demande.component.scss']
})
export class NouvelleDemandeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private demandeService = inject(DemandeService);
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);

  activeIndex = 0;
  items: MenuItem[] = [
    { label: 'Paroisse', icon: 'pi pi-map-marker' },
    { label: 'Informations', icon: 'pi pi-user' },
    { label: 'Vérification', icon: 'pi pi-check-circle' }
  ];

  step1Form: FormGroup;
  step2Form: FormGroup;

  paroisses: Paroisse[] = [];
  loadingParoisses = false;
  submitting = false;

  maxDate = new Date();
  frenchLocale = {
    firstDayOfWeek: 1,
    dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    dayNamesMin: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
    monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    monthNamesShort: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    today: 'Aujourd\'hui',
    clear: 'Effacer'
  };

  constructor() {
    this.step1Form = this.fb.group({
      paroisse_id: [null, Validators.required]
    });

    this.step2Form = this.fb.group({
      prenoms_recherche: ['', [Validators.required, Validators.minLength(2)]],
      nom_recherche: ['', [Validators.required, Validators.minLength(2)]],
      date_naissance_recherche: [null],
      nom_pere_recherche: [''],
      nom_mere_recherche: ['']
    });
  }

  ngOnInit(): void {
    this.loadParoisses();
  }

  loadParoisses(): void {
    this.loadingParoisses = true;
    this.apiService.get<Paroisse[]>('paroisses').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.paroisses = response.data;
        }
        this.loadingParoisses = false;
      },
      error: () => {
        this.loadingParoisses = false;
        this.notificationService.error('Erreur lors du chargement des paroisses');
      }
    });
  }

  nextStep(): void {
    if (this.activeIndex === 0 && this.step1Form.invalid) {
      this.step1Form.markAllAsTouched();
      return;
    }

    if (this.activeIndex === 1 && this.step2Form.invalid) {
      this.step2Form.markAllAsTouched();
      return;
    }

    if (this.activeIndex < 2) {
      this.activeIndex++;
    }
  }

  previousStep(): void {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  onSubmit(): void {
    if (this.step1Form.invalid || this.step2Form.invalid) {
      this.notificationService.warning('Veuillez remplir tous les champs requis');
      return;
    }

    this.submitting = true;

    const formData = {
      ...this.step1Form.value,
      ...this.step2Form.value,
      date_naissance_recherche: this.step2Form.value.date_naissance_recherche 
        ? this.formatDate(this.step2Form.value.date_naissance_recherche) 
        : null
    };

    this.demandeService.create(formData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.notificationService.success('Demande créée avec succès !');
          this.router.navigate(['/citoyen/demandes', response.data.id]);
        }
        this.submitting = false;
      },
      error: () => {
        this.submitting = false;
        this.notificationService.error('Erreur lors de la création de la demande');
      }
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getSelectedParoisse(): Paroisse | undefined {
    const id = this.step1Form.get('paroisse_id')?.value;
    return this.paroisses.find(p => p.id === id);
  }

  get paroisse_id() {
    return this.step1Form.get('paroisse_id');
  }

  get prenoms_recherche() {
    return this.step2Form.get('prenoms_recherche');
  }

  get nom_recherche() {
    return this.step2Form.get('nom_recherche');
  }
}