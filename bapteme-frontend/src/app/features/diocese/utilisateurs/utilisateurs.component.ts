import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms'; 
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { InputMaskModule } from 'primeng/inputmask';
import { PasswordModule } from 'primeng/password';
import { ConfirmationService } from 'primeng/api';

import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User, Paroisse } from '../../../core/models/user.model'; 
import { PaginatedResponse, ApiResponse } from '../../../core/models/api-response.model';

type Severity = 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined;

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule, 
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    TagModule,
    ConfirmDialogModule,
    TooltipModule,
    InputMaskModule,
    PasswordModule
  ],
  providers: [ConfirmationService],
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.scss']
})
export class UtilisateursComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  // Data
  utilisateurs: User[] = [];
  paroisses: Paroisse[] = [];
  loading = true;

  // Dialog
  showDialog = false;
  dialogTitle = 'Nouvel utilisateur';
  utilisateurForm: FormGroup;
  submitting = false;
  editMode = false;
  selectedUser: User | null = null;

  // Filters
  searchTerm = '';
  roleFilter: string | null = null;
  paroisseFilter: number | null = null;

  // Options
  roleOptions = [
    { label: 'Tous', value: null },
    { label: 'Admin', value: 'admin' },
    { label: 'Diocèse', value: 'diocese' },
    { label: 'Responsable Paroisse', value: 'responsable_paroisse' },
    { label: 'Agent Paroissial', value: 'agent_paroissial' },
    { label: 'Citoyen', value: 'citoyen' }
  ];

  roleOptionsForm = [
    { label: 'Admin', value: 'admin' },
    { label: 'Diocèse', value: 'diocese' },
    { label: 'Responsable Paroisse', value: 'responsable_paroisse' },
    { label: 'Agent Paroissial', value: 'agent_paroissial' },
    { label: 'Citoyen', value: 'citoyen' }
  ];

  // Pagination
  totalRecords = 0;
  first = 0;
  rows = 10;

  constructor() {
    this.utilisateurForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      role: ['citoyen', Validators.required],
      paroisse_id: [null],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]],
      active: [true]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.loadUtilisateurs();
    this.loadParoisses();
    this.setupRoleValidation();
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('password_confirmation');

    if (password && confirmPassword && password.value && confirmPassword.value && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.hasError('passwordMismatch')) {
        confirmPassword.setErrors(null);
    }
    return null;
  }

  setupRoleValidation(): void {
    this.utilisateurForm.get('role')?.valueChanges.subscribe(role => {
      const paroisseControl = this.utilisateurForm.get('paroisse_id');

      if (role === 'agent_paroissial' || role === 'responsable_paroisse') {
        paroisseControl?.setValidators([Validators.required]);
      } else {
        paroisseControl?.clearValidators();
        paroisseControl?.setValue(null);
      }

      paroisseControl?.updateValueAndValidity();
    });
  }

  loadUtilisateurs(): void {
    this.loading = true;

    const params: any = {
      page: Math.floor(this.first / this.rows) + 1,
      per_page: this.rows
    };

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    if (this.roleFilter) {
      params.role = this.roleFilter;
    }

    // CORRECTION : Ne pas envoyer 'all' ou valeur invalide
    if (this.paroisseFilter && this.paroisseFilter !== null) {
      params.paroisse_id = this.paroisseFilter;
    }

    this.apiService.getPaginated<User>('utilisateurs', params).subscribe({
      next: (response) => {
        this.utilisateurs = response.data?.data || [];
        this.totalRecords = response.data?.total || 0; 
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Erreur lors du chargement des utilisateurs');
      }
    });
  }

  loadParoisses(): void {
    // CORRECTION : Utiliser 'paroisses' au lieu de 'paroisses/all'
    // La méthode index() du ParoisseController retourne toutes les paroisses par défaut
    this.apiService.get<Paroisse[]>('paroisses').subscribe({
      next: (response) => {
        this.paroisses = response.data || [];
      },
      error: (err) => {
        console.error('Erreur chargement paroisses:', err);
        this.notificationService.error('Erreur lors du chargement des paroisses');
      }
    });
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.loadUtilisateurs();
  }

  onFilter(): void {
    this.first = 0;
    this.loadUtilisateurs();
  }

  openCreateDialog(): void {
    this.editMode = false;
    this.selectedUser = null;
    this.dialogTitle = 'Nouvel utilisateur';

    this.utilisateurForm.reset({
      role: 'citoyen',
      active: true,
      paroisse_id: null,
      password: '',
      password_confirmation: ''
    });

    this.utilisateurForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.utilisateurForm.get('password_confirmation')?.setValidators([Validators.required]);
    this.utilisateurForm.updateValueAndValidity();
    this.setupRoleValidation(); 
    
    this.showDialog = true;
  }

  openEditDialog(user: User): void {
    this.editMode = true;
    this.selectedUser = user;
    this.dialogTitle = `Modifier ${user.name}`;

    this.utilisateurForm.get('password')?.clearValidators();
    this.utilisateurForm.get('password_confirmation')?.clearValidators();
    this.utilisateurForm.updateValueAndValidity();

    const phoneValue = user.phone 
      ? user.phone.replace(/^\+221/, '').trim().replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')
      : null;

    this.utilisateurForm.patchValue({
      name: user.name,
      email: user.email,
      phone: phoneValue,
      role: user.role,
      paroisse_id: user.paroisse_id || null,
      active: user.active,
      password: null, 
      password_confirmation: null
    });

    this.showDialog = true;
  }

  onSubmit(): void {
    if (this.utilisateurForm.invalid) {
      Object.keys(this.utilisateurForm.controls).forEach(key => {
        this.utilisateurForm.get(key)?.markAsTouched();
      });
      this.notificationService.error('Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    this.submitting = true;

    const rawData = this.utilisateurForm.value;

    const formData = {
      ...rawData,
      phone: rawData.phone ? '+221' + rawData.phone.replace(/ /g, '') : null,
      paroisse_id: rawData.paroisse_id || undefined 
    };

    if (this.editMode) {
      delete formData.password_confirmation;
      if (!formData.password) {
        delete formData.password;
      }
    }

    const request = this.editMode && this.selectedUser
      ? this.apiService.put(`utilisateurs/${this.selectedUser.id}`, formData)
      : this.apiService.post('utilisateurs', formData);

    request.subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success(
            this.editMode ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès'
          );
          this.showDialog = false;
          this.loadUtilisateurs();
        }
        this.submitting = false;
      },
      error: (err) => {
        this.submitting = false;
        this.notificationService.error(err.error?.message || 'Erreur lors de l\'enregistrement');
      }
    });
  }

  toggleActive(user: User): void {
    const action = user.active ? 'désactiver' : 'activer';

    this.confirmationService.confirm({
      message: `Voulez-vous vraiment ${action} cet utilisateur ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.apiService.put(`utilisateurs/${user.id}/toggle-active`, { active: !user.active }).subscribe({
          next: (response) => {
            if (response.success) {
              this.notificationService.success(`Utilisateur ${action}é avec succès`);
              this.loadUtilisateurs();
            }
          },
          error: () => {
            this.notificationService.error(`Erreur lors de la ${action}ation`);
          }
        });
      }
    });
  }

  deleteUser(user: User): void {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.name}" ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.apiService.delete(`utilisateurs/${user.id}`).subscribe({
          next: (response) => {
            if (response.success) {
              this.notificationService.success('Utilisateur supprimé avec succès');
              this.loadUtilisateurs();
            }
          },
          error: () => {
            this.notificationService.error('Erreur lors de la suppression');
          }
        });
      }
    });
  }

  getRoleSeverity(role: string): Severity {
    const severities: { [key: string]: Severity } = {
      'admin': 'danger',
      'diocese': 'warning',
      'responsable_paroisse': 'info',
      'agent_paroissial': 'success',
      'citoyen': 'secondary'
    };
    return severities[role] || 'secondary'; 
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'admin': 'Admin',
      'diocese': 'Diocèse',
      'responsable_paroisse': 'Responsable',
      'agent_paroissial': 'Agent',
      'citoyen': 'Citoyen'
    };
    return labels[role] || role;
  }

  needsParoisse(): boolean {
    const role = this.utilisateurForm.get('role')?.value;
    return role === 'agent_paroissial' || role === 'responsable_paroisse';
  }

  // Form getters
  get name() { return this.utilisateurForm.get('name'); }
  get email() { return this.utilisateurForm.get('email'); }
  get phone() { return this.utilisateurForm.get('phone'); }
  get role() { return this.utilisateurForm.get('role'); }
  get paroisse_id() { return this.utilisateurForm.get('paroisse_id'); }
  get password() { return this.utilisateurForm.get('password'); }
  get password_confirmation() { return this.utilisateurForm.get('password_confirmation'); }
}