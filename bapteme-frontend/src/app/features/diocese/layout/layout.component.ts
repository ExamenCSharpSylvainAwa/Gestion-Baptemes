import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-diocese-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    SidebarModule,
    ButtonModule,
    AvatarModule
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  authService = inject(AuthService);
  sidebarVisible = false;

  menuItems = [
    {
      label: 'Tableau de bord',
      icon: 'pi pi-chart-line',
      route: '/diocese/dashboard'
    },
    {
      label: 'Paroisses',
      icon: 'pi pi-building',
      route: '/diocese/paroisses/liste'
    },
    {
      label: 'Statistiques',
      icon: 'pi pi-chart-pie',
      route: '/diocese/statistiques'
    },
    {
      label: 'Utilisateurs',
      icon: 'pi pi-users',
      route: '/diocese/utilisateurs'
    }
  ];

  logout(): void {
    this.authService.logout();
  }
}