import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import * as AdminActions from './admin.actions';
import { StatisticsService } from '../../core/services/statistics.service';
import { UserService } from '../../core/services/user.service';
import { OrganizationService } from '../../core/services/organization.service';
import { Organization, OrganizationStatus, VerificationStatus, OrganizationProfile, OrganizationType, OrganizationCategory, OrganizationSize, DocumentType } from '../../core/models/organization.model';

@Injectable()
export class AdminEffects {
  constructor(
    private actions$: Actions,
    private statisticsService: StatisticsService,
    private userService: UserService,
    private organizationService: OrganizationService,
    private snackBar: MatSnackBar
  ) {}

  loadStatistics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadAdminStatistics),
      switchMap(() =>
        this.statisticsService.getAdminStatistics().pipe(
          map(response => 
            AdminActions.loadAdminStatisticsSuccess({ statistics: response.data })
          ),
          catchError(error => {
            this.showError('Failed to load statistics');
            return of(AdminActions.loadAdminStatisticsFailure({ error: error.message }));
          })
        )
      )
    )
  );

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadUsers),
      switchMap(({ page, size }) =>
        this.userService.getUsers(page, size).pipe(
          map(response => 
            AdminActions.loadUsersSuccess({
              users: response.content || [],
              totalUsers: response.totalElements || 0
            })
          ),
          catchError(error => {
            this.showError('Failed to load users');
            return of(AdminActions.loadUsersFailure({ error: error.message }));
          })
        )
      )
    )
  );

  lockUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.lockUserAccount),
      mergeMap(({ userId }) =>
        this.userService.lockUserAccount(userId).pipe(
          map(() => {
            this.showSuccess('User account locked successfully');
            return AdminActions.lockUserAccountSuccess({ userId });
          }),
          catchError(error => {
            this.showError('Failed to lock user account');
            return of(AdminActions.lockUserAccountFailure({ error: error.message }));
          })
        )
      )
    )
  );

  unlockUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.unlockUserAccount),
      mergeMap(({ userId }) =>
        this.userService.unlockUserAccount(userId).pipe(
          map(() => {
            this.showSuccess('User account unlocked successfully');
            return AdminActions.unlockUserAccountSuccess({ userId });
          }),
          catchError(error => {
            this.showError('Failed to unlock user account');
            return of(AdminActions.unlockUserAccountFailure({ error: error.message }));
          })
        )
      )
    )
  );

  updateUserRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.updateUserRole),
      mergeMap(({ userId, role }) =>
        this.userService.updateUserRole(userId, role).pipe(
          map(() => {
            this.showSuccess('User role updated successfully');
            return AdminActions.updateUserRoleSuccess({ userId, role });
          }),
          catchError(error => {
            this.showError('Failed to update user role');
            return of(AdminActions.updateUserRoleFailure({ error: error.message }));
          })
        )
      )
    )
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.deleteUser),
      mergeMap(({ userId }) =>
        this.userService.deleteUser(userId).pipe(
          map(() => {
            this.showSuccess('User deleted successfully');
            return AdminActions.deleteUserSuccess({ userId });
          }),
          catchError(error => {
            this.showError('Failed to delete user');
            return of(AdminActions.deleteUserFailure({ error: error.message }));
          })
        )
      )
    )
  );

  loadOrganizations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadOrganizations),
      switchMap(({ page, size }) =>
        this.organizationService.getAllOrganizations(page, size).pipe(
          map(response => {
            // Convert OrganizationProfile to Organization
            const organizations: Organization[] = (response.content || []).map(org => this.convertToOrganization(org));
            return AdminActions.loadOrganizationsSuccess({
              organizations: organizations,
              totalOrganizations: response.totalElements || 0
            });
          }),
          catchError(error => {
            this.showError('Failed to load organizations');
            return of(AdminActions.loadOrganizationsFailure({ error: error.message }));
          })
        )
      )
    )
  );

  verifyOrganization$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.verifyOrganization),
      mergeMap(({ organizationId }) =>
        this.organizationService.updateOrganization(organizationId, { verificationStatus: VerificationStatus.VERIFIED }).pipe(
          map(() => {
            this.showSuccess('Organization verified successfully');
            return AdminActions.verifyOrganizationSuccess({ organizationId });
          }),
          catchError(error => {
            this.showError('Failed to verify organization');
            return of(AdminActions.verifyOrganizationFailure({ error: error.message }));
          })
        )
      )
    )
  );

  suspendOrganization$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.suspendOrganization),
      mergeMap(({ organizationId }) =>
        this.organizationService.updateOrganization(organizationId, { status: OrganizationStatus.SUSPENDED }).pipe(
          map(() => {
            this.showSuccess('Organization suspended successfully');
            return AdminActions.suspendOrganizationSuccess({ organizationId });
          }),
          catchError(error => {
            this.showError('Failed to suspend organization');
            return of(AdminActions.suspendOrganizationFailure({ error: error.message }));
          })
        )
      )
    )
  );

  reactivateOrganization$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.reactivateOrganization),
      mergeMap(({ organizationId }) =>
        this.organizationService.updateOrganization(organizationId, { status: OrganizationStatus.ACTIVE }).pipe(
          map(() => {
            this.showSuccess('Organization reactivated successfully');
            return AdminActions.reactivateOrganizationSuccess({ organizationId });
          }),
          catchError(error => {
            this.showError('Failed to reactivate organization');
            return of(AdminActions.reactivateOrganizationFailure({ error: error.message }));
          })
        )
      )
    )
  );

  deleteOrganization$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.deleteOrganization),
      mergeMap(({ organizationId }) =>
        this.organizationService.deleteOrganization(organizationId).pipe(
          map(() => {
            this.showSuccess('Organization deleted successfully');
            return AdminActions.deleteOrganizationSuccess({ organizationId });
          }),
          catchError(error => {
            this.showError('Failed to delete organization');
            return of(AdminActions.deleteOrganizationFailure({ error: error.message }));
          })
        )
      )
    )
  );

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { 
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { 
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Converts an OrganizationProfile to an Organization model
   */
  private convertToOrganization(profile: OrganizationProfile): Organization {
    return {
      id: profile.id,
      name: profile.name,
      description: profile.description,
      email: profile.email,
      phone: profile.phoneNumber,
      website: profile.website,
      logoUrl: profile.logo,
      location: `${profile.city}, ${profile.country}`,
      mission: profile.mission,
      vision: profile.vision,
      type: profile.type || OrganizationType.OTHER,
      category: profile.category || OrganizationCategory.OTHER,
      status: profile.acceptingVolunteers ? OrganizationStatus.ACTIVE : OrganizationStatus.INACTIVE,
      verificationStatus: profile.verified ? VerificationStatus.VERIFIED : VerificationStatus.PENDING,
      size: profile.size || OrganizationSize.SMALL,
      foundedYear: profile.foundedYear,
      registrationNumber: profile.registrationNumber,
      documents: profile.documents?.map(doc => ({
        id: doc,
        name: 'Document',
        type: DocumentType.OTHER,
        url: doc,
        uploadedAt: new Date()
      })) || [],
      address: {
        street: profile.address,
        city: profile.city,
        state: profile.province,
        country: profile.country,
        postalCode: profile.postalCode,
        latitude: profile.coordinates?.[0],
        longitude: profile.coordinates?.[1]
      },
      socialMedia: profile.socialMediaLinks,
      stats: {
        totalEvents: profile.totalEventsHosted || 0,
        activeEvents: 0,
        totalVolunteers: profile.activeVolunteers || 0,
        activeVolunteers: profile.activeVolunteers || 0,
        totalHours: profile.totalVolunteerHours || 0,
        averageRating: profile.rating || 0
      },
      createdAt: new Date(profile.createdAt),
      updatedAt: new Date(profile.updatedAt),
      eventCount: profile.totalEventsHosted,
      rating: profile.rating,
      reviewCount: profile.numberOfRatings
    };
  }
} 