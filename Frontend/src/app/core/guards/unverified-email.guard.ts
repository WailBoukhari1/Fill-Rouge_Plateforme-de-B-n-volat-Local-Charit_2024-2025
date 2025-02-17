import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUser } from '../../store/auth/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class UnverifiedEmailGuard implements CanActivate {
  constructor(
    private store: Store,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.store.select(selectUser).pipe(
      take(1),
      map(user => {
        // If no user, redirect to login
        if (!user) {
          return this.router.createUrlTree(['/auth/login']);
        }

        // If email is already verified, redirect to appropriate dashboard
        if (user.emailVerified) {
          switch (user.role) {
            case 'ORGANIZATION':
              return this.router.createUrlTree(['/dashboard/organization']);
            case 'VOLUNTEER':
              return this.router.createUrlTree(['/dashboard/volunteer']);
            default:
              return this.router.createUrlTree(['/dashboard']);
          }
        }

        // Allow access only if email is not verified
        return !user.emailVerified;
      })
    );
  }
} 