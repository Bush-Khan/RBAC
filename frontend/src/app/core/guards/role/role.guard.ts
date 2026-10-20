import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user.model';

export const roleGuard: CanActivateFn = (route, state) => {
  let authService = inject(AuthService)
  let router = inject(Router)

  const allowedRoles = route.data['roles'] as UserRole[];

  if (authService.hasRole(...allowedRoles)) {
    return true
  }

  router.navigate(['/profile']);
  return false
};
