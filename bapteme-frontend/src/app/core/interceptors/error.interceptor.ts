import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        notificationService.error('Session expirée. Reconnectez-vous.');
      } else if (error.status === 403) {
        notificationService.error('Accès non autorisé.');
        router.navigate(['/unauthorized']);
      } else if (error.status === 404) {
        notificationService.error('Ressource non trouvée.');
      } else if (error.status === 422) {
        const errors = error.error?.errors;
        if (errors) {
          Object.values(errors).forEach((messages: any) => {
            messages.forEach((message: string) => {
              notificationService.error(message);
            });
          });
        }
      } else if (error.status === 500) {
        notificationService.error('Erreur serveur.');
      } else if (error.status === 0) {
        notificationService.error('Impossible de contacter le serveur.');
      }

      return throwError(() => error);
    })
  );
};