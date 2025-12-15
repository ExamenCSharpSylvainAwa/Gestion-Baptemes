import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'citoyen',
    loadChildren: () => import('./features/citoyen/citoyen.routes').then(m => m.CITOYEN_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['citoyen'] }
  },
  {
    path: 'paroisse',
    loadChildren: () => import('./features/paroisse/paroisse.routes').then(m => m.PAROISSE_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['agent_paroissial', 'responsable_paroisse', 'admin'] }
  },
  {
    path: 'verify/:numeroUnique',
    loadComponent: () => import('./features/verification/verification.component').then(m => m.VerificationComponent)
  },
  {
    path: 'verify',
    loadComponent: () => import('./features/verification/verification.component').then(m => m.VerificationComponent)
  },
    {
    path: 'diocese',
    loadChildren: () => import('./features/diocese/diocese.routes').then(m => m.DIOCESE_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['diocese', 'admin'] }
  },
  // ✅ ROUTE UNAUTHORIZED CORRIGÉE
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];