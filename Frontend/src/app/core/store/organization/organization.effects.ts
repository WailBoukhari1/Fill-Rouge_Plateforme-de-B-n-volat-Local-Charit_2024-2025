import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { OrganizationService } from '../../services/organization.service';
import { AuthService } from '../../services/auth.service';
import * as OrganizationActions from './organization.actions';
import { OrganizationState } from './organization.state';

@Injectable()
export class OrganizationEffects {
  loadProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrganizationActions.loadOrganizationProfile),
      mergeMap(() => {
        const userId = this.authService.getCurrentUserId();
        if (!userId) {
          return of(OrganizationActions.loadOrganizationProfileFailure({ error: 'No user ID found' }));
        }
        return this.organizationService.getOrganizationByUserId(userId).pipe(
          map(profile => OrganizationActions.loadOrganizationProfileSuccess({ profile })),
          catchError(error => of(OrganizationActions.loadOrganizationProfileFailure({ error: error.message })))
        );
      })
    )
  );

  updateProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrganizationActions.updateOrganizationProfile),
      withLatestFrom(this.store.select(state => state.organization.profile)),
      mergeMap(([action, currentProfile]) => {
        if (!currentProfile?.id) {
          return of(OrganizationActions.updateOrganizationProfileFailure({ error: 'No organization ID found' }));
        }
        return this.organizationService.updateOrganization(currentProfile.id, action.profile).pipe(
          map(response => OrganizationActions.updateOrganizationProfileSuccess({ profile: response.data })),
          catchError(error => of(OrganizationActions.updateOrganizationProfileFailure({ error: error.message })))
        );
      })
    )
  );

  updateProfilePicture$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrganizationActions.updateProfilePicture),
      withLatestFrom(this.store.select(state => state.organization.profile)),
      mergeMap(([action, currentProfile]) => {
        if (!currentProfile?.id) {
          return of(OrganizationActions.updateProfilePictureFailure({ error: 'No organization ID found' }));
        }
        return this.organizationService.uploadProfilePicture(currentProfile.id, action.file).pipe(
          map(profile => OrganizationActions.updateProfilePictureSuccess({ profile })),
          catchError(error => of(OrganizationActions.updateProfilePictureFailure({ error: error.message })))
        );
      })
    )
  );

  deleteOrganization$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrganizationActions.deleteOrganization),
      mergeMap(({ id }) =>
        this.organizationService.deleteOrganization(id).pipe(
          map(() => {
            this.authService.logout().subscribe();
            return OrganizationActions.deleteOrganizationSuccess();
          }),
          catchError(error => of(OrganizationActions.deleteOrganizationFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private store: Store<{ organization: OrganizationState }>
  ) {}
} 