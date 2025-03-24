import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../store/auth/auth.selectors';
import { UserRole } from '../../../core/models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class ProfileCompletedGuard implements CanActivate {
  constructor(
    private store: Store,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.store.select(selectUser).pipe(
      take(1),
      map(user => {
        if (!user) {
          return this.router.createUrlTree(['/auth/login']);
        }

        // Admin users can access all routes
        if (user.role === UserRole.ADMIN) {
          return true;
        }

        // Check if user is already on their profile page
        const currentUrl = this.router.url;
        if (currentUrl.includes('/profile')) {
          return true;
        }

        // Check if profile is completed based on role
        let isProfileComplete = false;
        switch (user.role) {
          case UserRole.VOLUNTEER:
            isProfileComplete = this.isVolunteerProfileComplete(user);
            if (!isProfileComplete) {
              return this.router.createUrlTree(['/volunteer/profile']);
            }
            break;
          case UserRole.ORGANIZATION:
            isProfileComplete = this.isOrganizationProfileComplete(user);
            if (!isProfileComplete) {
              return this.router.createUrlTree(['/organization/profile']);
            }
            break;
        }

        return true;
      })
    );
  }

  private isVolunteerProfileComplete(user: any): boolean {
    return !!(
      user.bio &&
      user.phoneNumber &&
      user.address &&
      user.city &&
      user.province &&
      user.country
    );
  }

  private isOrganizationProfileComplete(user: any): boolean {
    return !!(
      user.name &&
      user.description &&
      user.missionStatement &&
      user.phoneNumber &&
      user.address &&
      user.city &&
      user.province &&
      user.country &&
      user.type &&
      user.focusAreas?.length > 0
    );
  }
} 