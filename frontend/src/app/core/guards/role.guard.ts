import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService, type RoleName } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = (route.data?.['roles'] as RoleName[] | undefined) ?? [];

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  if (allowedRoles.length > 0 && !authService.hasRole(allowedRoles)) {
    return router.createUrlTree(['/login']);
  }

  return true;
};