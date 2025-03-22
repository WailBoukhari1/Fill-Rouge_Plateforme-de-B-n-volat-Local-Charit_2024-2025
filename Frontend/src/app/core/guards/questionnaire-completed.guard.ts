import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUser } from '../../store/auth/auth.selectors';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireCompletedGuard {
  constructor(
    private store: Store,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.store.select(selectUser).pipe(
      take(1),
      map(user => {
        // Admin users should be redirected to dashboard
        if (user?.role === UserRole.ADMIN) {
          return this.router.createUrlTree(['/dashboard']);
        }
        
        // Regular users with incomplete questionnaire can access
        if (user && !user.questionnaireCompleted) {
          return true;
        }

        // Redirect to dashboard if questionnaire is already completed
        return this.router.createUrlTree(['/dashboard']);
      })
    );
  }
}
