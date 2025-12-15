import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';
import { VerificationService } from '../../core/services/verification.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { VerificationResult } from '../../core/models/verification.model';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    ProgressSpinnerModule,
    MessageModule,
    DividerModule,
    NavbarComponent,
    FooterComponent
],
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss']
})
export class VerificationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private verificationService = inject(VerificationService);

  numeroUnique = '';
  loading = false;
  result: VerificationResult | null = null;
  error = false;
  errorMessage = '';

  ngOnInit(): void {
    const numero = this.route.snapshot.paramMap.get('numeroUnique');
    if (numero) {
      this.numeroUnique = numero;
      this.verifier();
    }
  }

  verifier(): void {
    if (!this.numeroUnique || this.numeroUnique.trim() === '') {
      this.errorMessage = 'Veuillez entrer un numéro d\'extrait';
      return;
    }

    this.loading = true;
    this.error = false;
    this.result = null;
    this.errorMessage = '';

    this.verificationService.verifier(this.numeroUnique.trim()).subscribe({
      next: (response) => {
        this.loading = false;
        this.result = response;
        this.error = !response.valide;
        
        if (this.error) {
          this.errorMessage = response.message || 'Extrait non trouvé ou invalide';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'Erreur lors de la vérification';
      }
    });
  }

  resetSearch(): void {
    this.numeroUnique = '';
    this.result = null;
    this.error = false;
    this.errorMessage = '';
  }
}