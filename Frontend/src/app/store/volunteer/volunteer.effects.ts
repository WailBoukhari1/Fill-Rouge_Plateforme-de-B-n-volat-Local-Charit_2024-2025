import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { StatisticsService } from '../../core/services/statistics.service';
import { AuthService } from '../../core/services/auth.service';
import * as VolunteerActions from './volunteer.actions';
import { StatisticsResponse, VolunteerStats } from '../../core/models/statistics.model';

@Injectable()
export class VolunteerEffects {
  loadStatistics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VolunteerActions.loadStatistics),
      mergeMap(() => {
        const userId = localStorage.getItem('userId') || '';
        return this.statisticsService.getVolunteerStatistics(userId).pipe(
          map((stats: VolunteerStats) => {
            const response: StatisticsResponse = {
              userId,
              userRole: 'VOLUNTEER',
              volunteerStats: stats,
              adminStats: undefined,
              organizationStats: undefined
            };
            return VolunteerActions.loadStatisticsSuccess({ statistics: response });
          }),
          catchError(error => of(VolunteerActions.loadStatisticsFailure({ error: error.message })))
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private statisticsService: StatisticsService,
    private store: Store,
    private authService: AuthService
  ) {}
} 