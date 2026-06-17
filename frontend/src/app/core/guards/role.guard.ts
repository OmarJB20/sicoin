import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const user: any = authService.getUser();

  if (!user) {
    router.navigate(['/']);
    return false;
  }

  const allowedRoles = route.data?.['roles'];

  if (!allowedRoles) {
    return true;
  }

  if (allowedRoles.includes(user.rol_id)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};