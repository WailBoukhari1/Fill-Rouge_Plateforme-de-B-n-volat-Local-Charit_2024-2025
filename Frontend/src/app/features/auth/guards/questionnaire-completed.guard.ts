import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../store/auth/auth.selectors';
import { UserRole } from '../../../core/models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireCompletedGuard implements CanActivate {
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

        // Admin users can access regardless of questionnaire status
        if (user.role === UserRole.ADMIN) {
          return true;
        }

        if (!user.questionnaireCompleted) {
          // If questionnaire is not completed, redirect to questionnaire page
          return this.router.createUrlTree(['/auth/questionnaire']);
        }

        // Allow access to protected routes if questionnaire is completed
        return true;
      })
    );
  }
}
