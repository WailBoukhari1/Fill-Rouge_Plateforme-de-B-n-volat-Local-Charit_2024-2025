import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { QuestionnaireService } from '../../../core/services/questionnaire.service';

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireGuard implements CanActivate {
  constructor(
    private questionnaireService: QuestionnaireService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.questionnaireService.checkQuestionnaireStatus().pipe(
      map(response => {
        const completed = response.data?.completed;

        if (completed) {
          // If questionnaire is completed, redirect to dashboard
          return this.router.createUrlTree(['/dashboard']);
        }

        // Allow access to questionnaire page if not completed
        return true;
      }),
      catchError(() => {
        // In case of error, allow access to questionnaire page
        return of(true);
      })
    );
  }
}
