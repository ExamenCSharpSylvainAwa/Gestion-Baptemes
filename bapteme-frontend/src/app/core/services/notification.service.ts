import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private messageService = inject(MessageService);

  success(message: string, title: string = 'Succès'): void {
    this.messageService.add({
      severity: 'success',
      summary: title,
      detail: message,
      life: 5000
    });
  }

  error(message: string, title: string = 'Erreur'): void {
    this.messageService.add({
      severity: 'error',
      summary: title,
      detail: message,
      life: 7000
    });
  }

  warning(message: string, title: string = 'Attention'): void {
    this.messageService.add({
      severity: 'warn',
      summary: title,
      detail: message,
      life: 5000
    });
  }

  info(message: string, title: string = 'Information'): void {
    this.messageService.add({
      severity: 'info',
      summary: title,
      detail: message,
      life: 5000
    });
  }
}