import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, retry, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import * as AdminActions from './admin.actions';
import { AdminService } from '../../core/services/admin.service';
import { UserService } from '../../core/services/user.service';
import { OrganizationService } from '../../core/services/organization.service';
import { Organization, OrganizationStatus, VerificationStatus, OrganizationProfile, OrganizationType, OrganizationCategory, OrganizationSize, DocumentType } from '../../core/models/organization.model';

@Injectable()
export class AdminEffects {
  constructor(
    private actions$: Actions,
    private adminService: AdminService,
    private userService: UserService,
    private organizationService: OrganizationService,
    private snackBar: MatSnackBar
  ) {}

  loadStatistics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadAdminStatistics),
      switchMap(() =>
        this.adminService.getAdminStatistics().pipe(
          retry(2),
          map((statistics: any) => 
            AdminActions.loadAdminStatisticsSuccess({ statistics })
          ),
          catchError(error => {
            this.showError('Failed to load statistics');
            console.error('Statistics error:', error);
            return of(AdminActions.loadAdminStatisticsFailure({ error: typeof error === 'string' ? error : 'Unknown error' }));
          })
        )
      )
    )
  );

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadUsers),
      switchMap(({ page, size }) =>
        this.adminService.getUsers(page, size).pipe(
          retry(2),
          map((response: any) => {
            if (!response || !response.users) {
              throw new Error('Invalid response format');
            }
            return AdminActions.loadUsersSuccess({
              users: response.users,
              totalUsers: response.totalUsers || 0
            });
          }),
          catchError(error => {
            this.showError('Failed to load users');
            console.error('Users error:', error);
            return of(AdminActions.loadUsersFailure({ error: typeof error === 'string' ? error : error.message || 'Unknown error' }));
          })
        )
      )
    )
  );

  lockUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.lockUserAccount),
      mergeMap(({ userId }) =>
        this.adminService.lockUserAccount(userId).pipe(
          map(() => {
            this.showSuccess('User account locked successfully');
            return AdminActions.lockUserAccountSuccess({ userId });
          }),
          catchError(error => {
            this.showError('Failed to lock user account');
            console.error('Lock user error:', error);
            return of(AdminActions.lockUserAccountFailure({ error: error.message || 'Unknown error' }));
          })
        )
      )
    )
  );

  unlockUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.unlockUserAccount),
      mergeMap(({ userId }) =>
        this.adminService.unlockUserAccount(userId).pipe(
          map(() => {
            this.showSuccess('User account unlocked successfully');
            return AdminActions.unlockUserAccountSuccess({ userId });
          }),
          catchError(error => {
            this.showError('Failed to unlock user account');
            console.error('Unlock user error:', error);
            return of(AdminActions.unlockUserAccountFailure({ error: error.message || 'Unknown error' }));
          })
        )
      )
    )
  );

  updateUserRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.updateUserRole),
      mergeMap(({ userId, role }) =>
        this.adminService.updateUserRole(userId, role).pipe(
          map(() => {
            this.showSuccess('User role updated successfully');
            return AdminActions.updateUserRoleSuccess({ userId, role });
          }),
          catchError(error => {
            this.showError('Failed to update user role');
            console.error('Update role error:', error);
            return of(AdminActions.updateUserRoleFailure({ error: error.message || 'Unknown error' }));
          })
        )
      )
    )
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.deleteUser),
      mergeMap(({ userId }) =>
        this.adminService.deleteUser(userId).pipe(
          map(() => {
            this.showSuccess('User deleted successfully');
            return AdminActions.deleteUserSuccess({ userId });
          }),
          catchError(error => {
            this.showError('Failed to delete user');
            console.error('Delete user error:', error);
            return of(AdminActions.deleteUserFailure({ error: error.message || 'Unknown error' }));
          })
        )
      )
    )
  );

  loadOrganizations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadOrganizations),
      switchMap(({ page, size }) =>
        this.adminService.getOrganizations(page, size).pipe(
          retry(2),
          map((response: any) => {
            console.log('Organizations response:', response);
            if (!response || !response.organizations) {
              throw new Error('Invalid response format');
            }
            return AdminActions.loadOrganizationsSuccess({
              organizations: response.organizations,
              totalOrganizations: response.totalOrganizations || 0
            });
          }),
          catchError(error => {
            this.showError('Failed to load organizations');
            console.error('Organizations error:', error);
            return of(AdminActions.loadOrganizationsFailure({ error: typeof error === 'string' ? error : error.message || 'Unknown error' }));
          })
        )
      )
    )
  );

  verifyOrganization$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.verifyOrganization),
      mergeMap(({ organizationId }) =>
        this.adminService.verifyOrganization(organizationId).pipe(
          map((response: any) => {
            console.log('Verify organization response:', response);
            this.showSuccess('Organization verified successfully');
            return AdminActions.verifyOrganizationSuccess({ 
              organizationId,
              organization: response 
            });
          }),
          catchError(error => {
            this.showError('Failed to verify organization');
            console.error('Verify organization error:', error);
            return of(AdminActions.verifyOrganizationFailure({ error: error.message || 'Unknown error' }));
          })
        )
      )
    )
  );

  suspendOrganization$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.suspendOrganization),
      mergeMap(({ organizationId }) =>
        this.adminService.suspendOrganization(organizationId).pipe(
          map((response: any) => {
            console.log('Suspend organization response:', response);
            this.showSuccess('Organization suspended successfully');
            return AdminActions.suspendOrganizationSuccess({ 
              organizationId,
              organization: response 
            });
          }),
          catchError(error => {
            this.showError('Failed to suspend organization');
            console.error('Suspend organization error:', error);
            return of(AdminActions.suspendOrganizationFailure({ error: error.message || 'Unknown error' }));
          })
        )
      )
    )
  );

  reactivateOrganization$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.reactivateOrganization),
      mergeMap(({ organizationId }) =>
        this.adminService.reactivateOrganization(organizationId).pipe(
          map((response: any) => {
            console.log('Reactivate organization response:', response);
            this.showSuccess('Organization reactivated successfully');
            return AdminActions.reactivateOrganizationSuccess({ 
              organizationId,
              organization: response 
            });
          }),
          catchError(error => {
            this.showError('Failed to reactivate organization');
            console.error('Reactivate organization error:', error);
            return of(AdminActions.reactivateOrganizationFailure({ error: error.message || 'Unknown error' }));
          })
        )
      )
    )
  );

  deleteOrganization$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.deleteOrganization),
      mergeMap(({ organizationId }) =>
        this.adminService.deleteOrganization(organizationId).pipe(
          map(() => {
            this.showSuccess('Organization deleted successfully');
            return AdminActions.deleteOrganizationSuccess({ organizationId });
          }),
          catchError(error => {
            this.showError('Failed to delete organization');
            console.error('Delete organization error:', error);
            return of(AdminActions.deleteOrganizationFailure({ error: error.message || 'Unknown error' }));
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