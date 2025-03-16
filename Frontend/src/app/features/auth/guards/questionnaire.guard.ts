import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../store/auth/auth.selectors';
import { UserRole } from '../../../core/models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireGuard implements CanActivate {
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

        // If questionnaire is completed or role is not UNASSIGNED, redirect to dashboard
        if (user.questionnaireCompleted || user.role !== UserRole.UNASSIGNED) {
          console.log('Questionnaire access denied:', {
            completed: user.questionnaireCompleted,
            role: user.role
          });
          return this.router.createUrlTree(['/dashboard']);
        }

        // Allow access only if role is UNASSIGNED and questionnaire is not completed
        return true;
      })
    );
  }
}
