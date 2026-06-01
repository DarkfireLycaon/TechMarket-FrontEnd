import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/service/auth';


export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // Deja pasar al usuario
  } else {
    // Si no está logueado, lo manda al login
    router.navigate(['/login']);
    return false;
  }
};