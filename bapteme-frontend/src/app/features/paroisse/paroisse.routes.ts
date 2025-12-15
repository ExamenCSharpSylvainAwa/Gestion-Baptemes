import { Routes } from '@angular/router';

export const PAROISSE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'baptemes',
    loadComponent: () => import('./baptemes-list/baptemes-list.component').then(m => m.BaptemesListComponent)
  },
  // ✅ IMPORTANT: Les routes spécifiques DOIVENT être AVANT les routes avec paramètres
  {
    path: 'baptemes/nouveau',
    loadComponent: () => import('./bapteme-form/bapteme-form.component').then(m => m.BaptemeFormComponent)
  },
  // ✅ Ajout de la route pour l'édition
  {
    path: 'baptemes/:id/edit',
    loadComponent: () => import('./bapteme-form/bapteme-form.component').then(m => m.BaptemeFormComponent)
  },
  // ✅ Cette route doit être APRÈS les routes spécifiques
  {
    path: 'baptemes/:id',
    loadComponent: () => import('./bapteme-detail/bapteme-detail.component').then(m => m.BaptemeDetailComponent)
  },
  {
    path: 'demandes',
    loadComponent: () => import('./demandes-validation/demandes-validation.component').then(m => m.DemandesValidationComponent)
  },
  // ✅ Même principe pour les demandes
  {
    path: 'demandes/:id',
    loadComponent: () => import('./demande-detail/demande-detail.component').then(m => m.DemandeDetailComponent)
  }
];