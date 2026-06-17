import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if (!token) {
    router.navigate(['/']);
    return false;
  }

  try {
    const user: any = authService.getUser();

    if (!user) {
      router.navigate(['/']);
      return false;
    }

    return true;

  } catch (e) {
    authService.logout();
    router.navigate(['/']);
    return false;
  }
};