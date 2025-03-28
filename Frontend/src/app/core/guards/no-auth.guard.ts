import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUser } from '../../store/auth/auth.selectors';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard {
  constructor(
    private store: Store,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.store.select(selectUser).pipe(
      take(1),
      map(user => {
        if (!user || !this.authService.isLoggedIn()) {
          return true;
        }

        // If user is already logged in, redirect to dashboard
        // The dashboard will handle showing appropriate content based on role
        return this.router.createUrlTree(['/dashboard']);
      })
    );
  }
} 