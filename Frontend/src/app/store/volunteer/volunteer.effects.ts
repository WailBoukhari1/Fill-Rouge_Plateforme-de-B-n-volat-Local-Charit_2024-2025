import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { StatisticsService } from '../../core/services/statistics.service';
import { AuthService } from '../../core/services/auth.service';
import * as VolunteerActions from './volunteer.actions';
import { VolunteerStatistics } from '../../core/services/volunteer.service';

@Injectable()
export class VolunteerEffects {
  loadStatistics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VolunteerActions.loadStatistics),
      mergeMap(() => {
        const userId = localStorage.getItem('userId') || '';
        return this.statisticsService.getVolunteerStatistics(userId).pipe(
          map((stats) => {
            const statistics: VolunteerStatistics = {
              totalEventsAttended: stats.totalEventsParticipated,
              upcomingEvents: stats.activeEvents,
              completedEvents: stats.completedEvents,
              canceledEvents: 0,
              eventsByCategory: stats.eventsByCategory,
              totalHoursVolunteered: stats.totalVolunteerHours,
              averageHoursPerEvent: stats.totalVolunteerHours / stats.totalEventsParticipated || 0,
              hoursByMonth: {},
              averageRating: stats.averageEventRating,
              reliabilityScore: stats.reliabilityScore,
              organizationsWorkedWith: stats.organizationsSupported,
              participationGrowthRate: 0,
              hoursGrowthRate: 0,
              participationByDay: {}
            };
            
            return VolunteerActions.loadStatisticsSuccess({ statistics });
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