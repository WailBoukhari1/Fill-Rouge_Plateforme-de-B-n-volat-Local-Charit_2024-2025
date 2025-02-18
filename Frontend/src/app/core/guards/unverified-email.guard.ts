import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUser } from '../../store/auth/auth.selectors';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UnverifiedEmailGuard {
  constructor(
    private store: Store,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.store.select(selectUser).pipe(
      take(1),
      map(user => {
        // If no user or not logged in, redirect to login
        if (!user || !this.authService.isLoggedIn()) {
          return this.router.createUrlTree(['/auth/login']);
        }

        // If email is already verified, redirect to dashboard
        if (user.emailVerified) {
          return this.router.createUrlTree(['/dashboard']);
        }

        // If account is locked or expired, redirect to appropriate page
        if (user.accountLocked) {
          return this.router.createUrlTree(['/auth/account-locked']);
        }
        if (user.accountExpired) {
          return this.router.createUrlTree(['/auth/account-expired']);
        }

        // Allow access only if email is not verified
        return !user.emailVerified;
      })
    );
  }
} 