import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { VolunteerService } from '../../core/services/volunteer.service';
import * as VolunteerActions from './volunteer.actions';

@Injectable()
export class VolunteerEffects {
  loadStatistics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VolunteerActions.loadStatistics),
      mergeMap(() =>
        this.volunteerService.getStatistics().pipe(
          map(statistics => VolunteerActions.loadStatisticsSuccess({ statistics })),
          catchError(error => 
            of(VolunteerActions.loadStatisticsFailure({ error: error.message }))
          )
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
          catchError(error => 
            of(VolunteerActions.loadHoursFailure({ error: error.message }))
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private volunteerService: VolunteerService
  ) {}
} 