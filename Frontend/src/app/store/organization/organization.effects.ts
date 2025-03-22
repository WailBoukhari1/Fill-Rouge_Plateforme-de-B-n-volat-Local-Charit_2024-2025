import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { OrganizationService } from '../../core/services/organization.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { StatisticsService } from '../../core/services/statistics.service';
import * as OrganizationActions from './organization.actions';
import { OrganizationType, OrganizationCategory, OrganizationSize, OrganizationRequest } from '../../core/models/organization.model';
import { Organization } from './organization.types';

@Injectable()
export class OrganizationEffects {
  loadProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrganizationActions.loadProfile),
      mergeMap(() => {
        const organizationId = this.authService.getCurrentOrganizationId();
        if (!organizationId) {
          return of(OrganizationActions.loadProfileFailure({ error: 'No organization ID found' }));
        }
        return this.organizationService
          .getOrganization(organizationId)
          .pipe(
            switchMap((response) => {
              const organizationProfile = {
                id: response.data.id,
                userId: response.data.userId,
                name: response.data.name,
                type: response.data.type || '',
                description: response.data.description,
                missionStatement: response.data.mission,
                vision: response.data.vision,
                website: response.data.website,
                registrationNumber: response.data.registrationNumber,
                phoneNumber: response.data.phoneNumber,
                address: response.data.address,
                city: response.data.city,
                province: response.data.province,
                country: response.data.country,
                postalCode: response.data.postalCode,
                coordinates: response.data.coordinates,
                focusAreas: response.data.focusAreas,
                foundedYear: response.data.foundedYear,
                socialMedia: response.data.socialMediaLinks,
                category: response.data.category,
                size: response.data.size,
                documents: response.data.documents,
                profilePicture: response.data.profilePicture
              } as Organization;
              
              // Dispatch actions to load profile and user data
              return [
                OrganizationActions.loadProfileSuccess({ profile: organizationProfile }),
                OrganizationActions.loadUserData({ userId: response.data.userId })
              ];
            }),
            catchError((error) =>
              of(
                OrganizationActions.loadProfileFailure({ error: error.message })
              )
            )
          );
      })
    )
  );

  loadUserData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrganizationActions.loadUserData),
      mergeMap(({ userId }) => {
        if (!userId) {
          return of(OrganizationActions.loadUserDataFailure({ error: 'No user ID provided' }));
        }
        
        return this.userService.getUserById(Number(userId)).pipe(
          map(user => OrganizationActions.loadUserDataSuccess({ userData: user })),
          catchError(error => of(OrganizationActions.loadUserDataFailure({ error: error.message })))
        );
      })
    )
  );

  loadStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrganizationActions.loadStats),
      mergeMap(() => {
        const organizationId = this.authService.getCurrentOrganizationId();
        if (!organizationId) {
          return of(OrganizationActions.loadStatsFailure({ error: 'No organization ID found' }));
        }
        return this.statisticsService
          .getOrganizationStatistics(organizationId)
          .pipe(
            map((response) =>
              OrganizationActions.loadStatsSuccess({ 
                statistics: {
                  totalEvents: response.data.totalEvents,
                  activeEvents: response.data.activeEvents,
                  totalVolunteers: response.data.totalVolunteers,
                  activeVolunteers: response.data.activeVolunteers,
                  totalHours: response.data.totalVolunteerHours,
                  averageRating: response.data.averageEventRating,
                  impactScore: response.data.peopleImpacted,
                  totalEventsHosted: response.data.totalEvents
                }
              })
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
        const organizationId = this.authService.getCurrentOrganizationId();
        if (!organizationId) {
          return of(OrganizationActions.updateProfileFailure({ error: 'No organization ID found' }));
        }
        return this.organizationService
          .updateOrganization(organizationId, profile as OrganizationRequest)
          .pipe(
            map((response) =>
              OrganizationActions.updateProfileSuccess({
                profile: {
                  ...response.data,
                  missionStatement: response.data.mission || '',
                  socialMedia: response.data.socialMediaLinks || {},
                  type: response.data.type || 'NONPROFIT'
                }
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
    private authService: AuthService,
    private statisticsService: StatisticsService,
    private userService: UserService
  ) {}
}
