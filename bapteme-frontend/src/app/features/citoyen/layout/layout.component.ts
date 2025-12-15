import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-citoyen-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
   
    ButtonModule,
    AvatarModule
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  authService = inject(AuthService);
  router = inject(Router);
  
  sidebarVisible = false;

  menuItems = [
    {
      label: 'Tableau de bord',
      icon: 'pi pi-home',
      route: '/citoyen/dashboard'
    },
    {
      label: 'Mes demandes',
      icon: 'pi pi-file',
      route: '/citoyen/demandes'
    },
    {
      label: 'Nouvelle demande',
      icon: 'pi pi-plus-circle',
      route: '/citoyen/demandes/nouvelle'
    },
    {
      label: 'Vérifier un extrait',
      icon: 'pi pi-qrcode',
      route: '/verify'
    }
  ];

  logout(): void {
    this.authService.logout();
  }
}