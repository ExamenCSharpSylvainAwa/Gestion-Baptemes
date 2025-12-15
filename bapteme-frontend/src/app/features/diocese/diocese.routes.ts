import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const DIOCESE_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent, // ✅ Wrapper avec sidebar
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: { breadcrumb: 'Tableau de bord' }
      },
      {
        path: 'paroisses',
        redirectTo: 'paroisses/liste',
        pathMatch: 'full'
      },
      {
        path: 'paroisses/liste',
        loadComponent: () => import('./paroisses/liste/liste.component').then(m => m.ListeComponent),
        data: { breadcrumb: 'Liste des paroisses' }
      },
      {
        path: 'paroisses/:id',
        loadComponent: () => import('./paroisses/details/details.component').then(m => m.DetailsComponent),
        data: { breadcrumb: 'Détails paroisse' }
      },
      {
        path: 'statistiques',
        loadComponent: () => import('./statistiques/statistiques.component').then(m => m.StatistiquesComponent),
        data: { breadcrumb: 'Statistiques' }
      },
      {
        path: 'utilisateurs',
        loadComponent: () => import('./utilisateurs/utilisateurs.component').then(m => m.UtilisateursComponent),
        data: { breadcrumb: 'Gestion des utilisateurs' }
      }
    ]
  }
];