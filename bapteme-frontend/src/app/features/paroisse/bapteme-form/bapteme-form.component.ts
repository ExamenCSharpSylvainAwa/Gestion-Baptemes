import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BaptemeService } from '../../../core/services/bapteme.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { Bapteme } from '../../../core/models/bapteme.model';

@Component({
  selector: 'app-bapteme-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    CardModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    InputNumberModule,
    ButtonModule,
    RadioButtonModule,
    ProgressSpinnerModule,
    NavbarComponent
  ],
  templateUrl: './bapteme-form.component.html',
  styleUrls: ['./bapteme-form.component.scss']
})
export class BaptemeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private baptemeService = inject(BaptemeService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  baptemeForm: FormGroup;
  loading = false;
  loadingData = false;
  currentYear = new Date().getFullYear();
  maxDate = new Date();
  
  // ✅ Variables pour le mode édition
  isEditMode = false;
  baptemeId: number | null = null;

  sexeOptions = [
    { label: 'Masculin', value: 'M' },
    { label: 'Féminin', value: 'F' }
  ];

  constructor() {
    const user = this.authService.currentUser();
    
    this.baptemeForm = this.fb.group({
      annee_enregistrement: [this.currentYear, [Validators.required, Validators.min(1900)]],
      numero_ordre: [null, [Validators.required, Validators.min(1)]],
      prenoms: ['', Validators.required],
      nom: ['', Validators.required],
      date_naissance: [null, Validators.required],
      lieu_naissance: ['', Validators.required],
      sexe: ['M', Validators.required],
      nom_pere: ['', Validators.required],
      nom_mere: ['', Validators.required],
      date_bapteme: [null, Validators.required],
      celebrant: ['', Validators.required],
      nom_parrain: [''],
      representant_parrain: [''],
      nom_marraine: [''],
      representante_marraine: [''],
      date_confirmation: [null],
      lieu_confirmation: [''],
      date_mariage: [null],
      conjoint: [''],
      paroisse_id: [user?.paroisse_id, Validators.required]
    });
  }

  ngOnInit(): void {
    // ✅ Vérifier si on est en mode édition
    this.checkEditMode();
  }

  private checkEditMode(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      
      // Si on a un ID et que ce n'est pas 'nouveau', on est en mode édition
      if (id && id !== 'nouveau') {
        this.isEditMode = true;
        this.baptemeId = +id;
        this.loadBaptemeData(this.baptemeId);
      } else {
        this.isEditMode = false;
        this.baptemeId = null;
      }
    });
  }

  private loadBaptemeData(id: number): void {
    this.loadingData = true;
    
    this.baptemeService.getById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const bapteme = response.data as Bapteme;
          this.patchFormValues(bapteme);
        }
        this.loadingData = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        this.notificationService.error('Erreur lors du chargement du baptême');
        this.loadingData = false;
        this.router.navigate(['/paroisse/baptemes']);
      }
    });
  }

  private patchFormValues(bapteme: Bapteme): void {
    this.baptemeForm.patchValue({
      annee_enregistrement: bapteme.annee_enregistrement,
      numero_ordre: bapteme.numero_ordre,
      prenoms: bapteme.prenoms,
      nom: bapteme.nom,
      date_naissance: bapteme.date_naissance ? new Date(bapteme.date_naissance) : null,
      lieu_naissance: bapteme.lieu_naissance,
      sexe: bapteme.sexe,
      nom_pere: bapteme.nom_pere,
      nom_mere: bapteme.nom_mere,
      date_bapteme: bapteme.date_bapteme ? new Date(bapteme.date_bapteme) : null,
      celebrant: bapteme.celebrant,
      nom_parrain: bapteme.nom_parrain || '',
      representant_parrain: bapteme.representant_parrain || '',
      nom_marraine: bapteme.nom_marraine || '',
      representante_marraine: bapteme.representante_marraine || '',
      date_confirmation: bapteme.date_confirmation ? new Date(bapteme.date_confirmation) : null,
      lieu_confirmation: bapteme.lieu_confirmation || '',
      date_mariage: bapteme.date_mariage ? new Date(bapteme.date_mariage) : null,
      conjoint: bapteme.conjoint || ''
    });
  }

  onSubmit(): void {
    if (this.baptemeForm.invalid) {
      this.baptemeForm.markAllAsTouched();
      this.notificationService.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.loading = true;
    const formData = this.formatFormData(this.baptemeForm.value);

    if (this.isEditMode && this.baptemeId) {
      // ✅ Mode édition - UPDATE
      this.baptemeService.update(this.baptemeId, formData).subscribe({
        next: (response) => {
          this.loading = false;
          this.notificationService.success('Baptême modifié avec succès !');
          this.router.navigate(['/paroisse/baptemes', this.baptemeId]);
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          this.loading = false;
          this.notificationService.error('Erreur lors de la modification');
        }
      });
    } else {
      // ✅ Mode création - CREATE
      this.baptemeService.create(formData).subscribe({
        next: (response) => {
          this.loading = false;
          this.notificationService.success('Baptême enregistré avec succès !');
          
          const bapteme = response.data as Bapteme | undefined;
          if (bapteme?.id) {
            this.router.navigate(['/paroisse/baptemes', bapteme.id]);
          } else {
            this.router.navigate(['/paroisse/baptemes']);
          }
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.loading = false;
          this.notificationService.error('Erreur lors de la création');
        }
      });
    }
  }

  onCancel(): void {
    if (this.isEditMode && this.baptemeId) {
      this.router.navigate(['/paroisse/baptemes', this.baptemeId]);
    } else {
      this.router.navigate(['/paroisse/baptemes']);
    }
  }

  private formatFormData(data: any): any {
    const formatted = { ...data };
    
    // Formater les dates au format YYYY-MM-DD
    ['date_naissance', 'date_bapteme', 'date_confirmation', 'date_mariage'].forEach(field => {
      if (formatted[field] && formatted[field] instanceof Date) {
        formatted[field] = this.formatDate(formatted[field]);
      } else if (!formatted[field]) {
        // Si la date est vide, on la met à null
        formatted[field] = null;
      }
    });

    // Nettoyer les champs optionnels vides
    ['nom_parrain', 'representant_parrain', 'nom_marraine', 'representante_marraine', 
     'lieu_confirmation', 'conjoint'].forEach(field => {
      if (formatted[field] === '') {
        formatted[field] = null;
      }
    });

    return formatted;
  }

  private formatDate(date: Date): string {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Getters pour la validation
  get prenoms() { return this.baptemeForm.get('prenoms'); }
  get nom() { return this.baptemeForm.get('nom'); }
  get date_naissance() { return this.baptemeForm.get('date_naissance'); }
  get lieu_naissance() { return this.baptemeForm.get('lieu_naissance'); }
  get nom_pere() { return this.baptemeForm.get('nom_pere'); }
  get nom_mere() { return this.baptemeForm.get('nom_mere'); }
  get date_bapteme() { return this.baptemeForm.get('date_bapteme'); }
  get celebrant() { return this.baptemeForm.get('celebrant'); }
  get numero_ordre() { return this.baptemeForm.get('numero_ordre'); }
  get annee_enregistrement() { return this.baptemeForm.get('annee_enregistrement'); }
}