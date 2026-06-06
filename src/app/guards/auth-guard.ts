import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  // Si existe el token, permitimos el acceso a la ruta
  if (token) {
    return true;
  }

  // Si NO está logueado, lo redirigimos a la pantalla de login
  // Le pasamos opcionalmente la ruta a la que quería ir para poder volver después
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};