import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const CITOYEN_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
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
        path: 'demandes',
        loadComponent: () => import('./demandes/liste/liste-demandes/liste-demandes.component').then(m => m.ListeDemandesComponent)
      },
      {
        path: 'demandes/nouvelle',
        loadComponent: () => import('./demandes/nouvelle/nouvelle-demande/nouvelle-demande.component').then(m => m.NouvelleDemandeComponent)
      },
      {
        path: 'demandes/:id',
        loadComponent: () => import('./demandes/details/details-demande/details-demande.component').then(m => m.DetailsDemandeComponent)
      }
    ]
  }
];