import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectIsAuthenticated } from '../../store/auth/auth.selectors';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private store: Store,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.store.select(selectIsAuthenticated).pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated && this.authService.isLoggedIn()) {
          return true;
        }

        // Store the attempted URL for redirecting
        const currentUrl = this.router.routerState.snapshot.url;
        return this.router.createUrlTree(['/auth/login'], {
          queryParams: { returnUrl: currentUrl }
        });
      })
    );
  }
} 