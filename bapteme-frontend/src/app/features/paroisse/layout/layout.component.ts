import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { AuthService } from '../../../core/services/auth.service';
import { DemandeService } from '../../../core/services/demande.service';

@Component({
  selector: 'app-paroisse-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    SidebarModule,
    ButtonModule,
    AvatarModule,
    BadgeModule
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  authService = inject(AuthService);
  private demandeService = inject(DemandeService);
  router = inject(Router);
  
  sidebarVisible = false;
  demandesEnAttente = 0;

  menuItems = [
    {
      label: 'Tableau de bord',
      icon: 'pi pi-home',
      route: '/paroisse/dashboard'
    },
    {
      label: 'Registre des baptêmes',
      icon: 'pi pi-book',
      route: '/paroisse/baptemes'
    },
    {
      label: 'Nouveau baptême',
      icon: 'pi pi-plus-circle',
      route: '/paroisse/baptemes/nouveau'
    },
    {
      label: 'Demandes à traiter',
      icon: 'pi pi-file-edit',
      route: '/paroisse/demandes',
      badge: 0
    }
  ];

  ngOnInit(): void {
    this.loadDemandesCount();
  }

  loadDemandesCount(): void {
    this.demandeService.getAll({ statut: 'en_attente', per_page: 1 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.demandesEnAttente = response.data.total;
          const demandesItem = this.menuItems.find(item => item.route === '/paroisse/demandes');
          if (demandesItem) {
            demandesItem.badge = this.demandesEnAttente;
          }
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  getRoleLabel(): string {
    const user = this.authService.currentUser();
    if (!user) return '';
    
    switch (user.role) {
      case 'responsable_paroisse':
        return 'Responsable Paroisse';
      case 'agent_paroissial':
        return 'Agent Paroissial';
      default:
        return user.role;
    }
  }
}