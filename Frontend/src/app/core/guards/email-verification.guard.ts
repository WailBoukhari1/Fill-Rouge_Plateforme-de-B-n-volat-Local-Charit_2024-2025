import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUser } from '../../store/auth/auth.selectors';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmailVerificationGuard {
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

        // If email is verified, allow access
        if (user.emailVerified) {
          return true;
        }

        // If email is not verified, redirect to verification page
        return this.router.createUrlTree(['/auth/verify-email'], {
          queryParams: { email: user.email }
        });
      })
    );
  }
} 