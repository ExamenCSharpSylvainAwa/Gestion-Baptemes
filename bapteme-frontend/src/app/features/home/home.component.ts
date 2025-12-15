import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  features = [
    {
      icon: 'pi pi-clock',
      title: 'Rapide',
      description: 'Obtenez votre extrait en 48h maximum'
    },
    {
      icon: 'pi pi-shield',
      title: 'Sécurisé',
      description: 'Plateforme 100% sécurisée avec QR code'
    },
    {
      icon: 'pi pi-mobile',
      title: 'Simple',
      description: 'Interface intuitive et facile à utiliser'
    },
    {
      icon: 'pi pi-wallet',
      title: 'Paiement Mobile',
      description: 'Wave, Orange Money, Free Money'
    }
  ];

  steps = [
    {
      number: 1,
      title: 'Créez votre compte',
      description: 'Inscrivez-vous gratuitement'
    },
    {
      number: 2,
      title: 'Faites votre demande',
      description: 'Remplissez le formulaire en ligne'
    },
    {
      number: 3,
      title: 'Payez en ligne',
      description: 'Paiement sécurisé par mobile money'
    },
    {
      number: 4,
      title: 'Téléchargez',
      description: 'Recevez votre extrait certifié'
    }
  ];
}