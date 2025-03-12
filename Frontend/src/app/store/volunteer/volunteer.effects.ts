import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, switchMap, take } from 'rxjs/operators';
import { VolunteerService } from '../../core/services/volunteer.service';
import { StatisticsService } from '../../core/services/statistics.service';
import { AuthService } from '../../core/services/auth.service';
import * as VolunteerActions from './volunteer.actions';

@Injectable()
export class VolunteerEffects {
  loadStatistics$ = createEffect(() => this.actions$.pipe(
    ofType(VolunteerActions.loadStatistics),
    switchMap(() => this.authService.currentUser$.pipe(
      take(1),
      switchMap(user => {
        if (!user?.id) {
          return of(VolunteerActions.loadStatisticsFailure({ error: 'User not found' }));
        }
        return this.statisticsService.getVolunteerStats(user.id.toString()).pipe(
          map(volunteerStats => VolunteerActions.loadStatisticsSuccess({ 
            statistics: { volunteerStats, organizationStats: undefined, adminStats: undefined } 
          })),
          catchError(error => of(VolunteerActions.loadStatisticsFailure({ error: error.message })))
        );
      })
    ))
  ));

  loadDetailedStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VolunteerActions.loadDetailedStats),
      mergeMap(() =>
        this.statisticsService.getDetailedVolunteerStats().pipe(
          map(detailedStats => VolunteerActions.loadDetailedStatsSuccess({ detailedStats })),
          catchError(error => of(VolunteerActions.loadDetailedStatsFailure({ error: error.message })))
        )
      )
    )
  );

  loadHours$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VolunteerActions.loadHours),
      mergeMap(() =>
        this.volunteerService.getVolunteerHours().pipe(
          map(hours => VolunteerActions.loadHoursSuccess({ hours })),
          catchError(error => of(VolunteerActions.loadHoursFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private volunteerService: VolunteerService,
    private statisticsService: StatisticsService,
    private authService: AuthService
  ) {}
} 