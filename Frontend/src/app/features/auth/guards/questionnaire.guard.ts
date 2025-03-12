import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../store/auth/auth.selectors';

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
        if (!user) {
          return this.router.createUrlTree(['/auth/login']);
        }

        if (user.questionnaireCompleted) {
          // If questionnaire is completed, redirect to dashboard
          return this.router.createUrlTree(['/dashboard']);
        }

        // Allow access to questionnaire page if not completed
        return true;
      })
    );
  }
}
