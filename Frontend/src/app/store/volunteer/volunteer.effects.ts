import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { StatisticsService } from '../../core/services/statistics.service';
import { AuthService } from '../../core/services/auth.service';
import * as VolunteerActions from './volunteer.actions';
import { StatisticsResponse, VolunteerStats } from '../../core/models/statistics.model';
import { VolunteerStatistics } from '../../core/services/volunteer.service';

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
            
            // Convert VolunteerStats to VolunteerStatistics
            const statistics: VolunteerStatistics = {
              totalEventsAttended: stats.eventsParticipated,
              upcomingEvents: 0, // Add these fields based on your data
              completedEvents: 0,
              canceledEvents: 0,
              eventsByCategory: {},
              totalHoursVolunteered: stats.totalHoursVolunteered,
              averageHoursPerEvent: stats.totalHoursVolunteered / stats.eventsParticipated || 0,
              hoursByMonth: {},
              averageRating: stats.impactScore,
              reliabilityScore: stats.attendanceRate,
              organizationsWorkedWith: 0,
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