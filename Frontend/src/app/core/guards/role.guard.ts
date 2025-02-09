import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export type UserRole = 'ADMIN' | 'ORGANIZATION' | 'VOLUNTEER';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    return authService.getCurrentUser().pipe(
      take(1),
      map(user => {
        if (!user) {
          return router.createUrlTree(['/auth/login']);
        }

        const hasAllowedRole = user.roles.some(role => allowedRoles.includes(role as UserRole));
        if (hasAllowedRole) {
          return true;
        }

        // Redirect to home page or unauthorized page
        return router.createUrlTree(['/']);
      })
    );
  };
}; 