import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // Tu servicio de login
  const router = inject(Router);

  if (authService.isAdmin()) { // Debes tener este método en tu servicio
    return true;
  } else {
    router.navigate(['/home']);
    return false;
  }
};