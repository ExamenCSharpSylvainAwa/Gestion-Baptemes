import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    MenubarModule,
    AvatarModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }

  getDashboardLink(): string {
    const user = this.authService.currentUser();
    if (!user) return '/';

    switch (user.role) {
      case 'citoyen':
        return '/citoyen/dashboard';
      case 'agent_paroissial':
      case 'responsable_paroisse':
        return '/paroisse/dashboard';
      case 'diocese':
      case 'admin':
        return '/diocese/dashboard';
      default:
        return '/';
    }
  }
}