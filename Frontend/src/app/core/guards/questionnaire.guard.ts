import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUser } from '../../store/auth/auth.selectors';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireGuard {
  constructor(
    private store: Store,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.store.select(selectUser).pipe(
      take(1),
      map(user => {
        if (user && user.questionnaireCompleted) {
          return true;
        }

        // Redirect to questionnaire if not completed
        return this.router.createUrlTree(['/auth/questionnaire']);
      })
    );
  }
}
