import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { QuestionnaireService } from '../../../core/services/questionnaire.service';

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireCompletedGuard implements CanActivate {
  constructor(
    private questionnaireService: QuestionnaireService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.questionnaireService.checkQuestionnaireStatus().pipe(
      map(response => {
        const completed = response.data?.completed;

        if (!completed) {
          // If questionnaire is not completed, redirect to questionnaire page
          return this.router.createUrlTree(['/auth/questionnaire']);
        }

        // Allow access to protected routes if questionnaire is completed
        return true;
      }),
      catchError(() => {
        // In case of error, redirect to questionnaire page
        return of(this.router.createUrlTree(['/auth/questionnaire']));
      })
    );
  }
}
