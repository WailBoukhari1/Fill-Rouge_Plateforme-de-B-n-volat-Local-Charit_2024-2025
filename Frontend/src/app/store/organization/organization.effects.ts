import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { OrganizationService } from '../../core/services/organization.service';
import { AuthService } from '../../core/auth/auth.service';
import * as OrganizationActions from './organization.actions';

@Injectable()
export class OrganizationEffects {
  loadProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrganizationActions.loadProfile),
      mergeMap(() => {
        const organizationId = this.authService.getCurrentUserId();
        return this.organizationService
          .getOrganizationById(organizationId)
          .pipe(
            map((profile) =>
              OrganizationActions.loadProfileSuccess({ profile })
            ),
            catchError((error) =>
              of(
                OrganizationActions.loadProfileFailure({ error: error.message })
              )
            )
          );
      })
    )
  );

  loadStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrganizationActions.loadStats),
      mergeMap(() => {
        const organizationId = this.authService.getCurrentUserId();
        return this.organizationService
          .getOrganizationStats(organizationId)
          .pipe(
            map((statistics) =>
              OrganizationActions.loadStatsSuccess({ statistics })
            ),
            catchError((error) =>
              of(OrganizationActions.loadStatsFailure({ error: error.message }))
            )
          );
      })
    )
  );

  updateProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrganizationActions.updateProfile),
      mergeMap(({ profile }) => {
        const organizationId = this.authService.getCurrentUserId();
        return this.organizationService
          .updateOrganization(organizationId, profile)
          .pipe(
            map((updatedProfile) =>
              OrganizationActions.updateProfileSuccess({
                profile: updatedProfile,
              })
            ),
            catchError((error) =>
              of(
                OrganizationActions.updateProfileFailure({
                  error: error.message,
                })
              )
            )
          );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private organizationService: OrganizationService,
    private authService: AuthService
  ) {}
}
