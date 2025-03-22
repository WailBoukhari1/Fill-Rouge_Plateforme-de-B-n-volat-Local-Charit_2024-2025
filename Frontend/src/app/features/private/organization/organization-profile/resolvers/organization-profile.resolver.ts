import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of, forkJoin } from 'rxjs';
import { take, map, catchError, switchMap } from 'rxjs/operators';
import { OrganizationService } from '../../../../../core/services/organization.service';
import { UserService } from '../../../../../core/services/user.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { OrganizationProfile } from '../../../../../core/models/organization.model';
import { User } from '../../../../../core/models/auth.models';

export interface OrganizationProfileData {
  organization: OrganizationProfile;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class OrganizationProfileResolver implements Resolve<OrganizationProfileData | null> {
  constructor(
    private organizationService: OrganizationService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<OrganizationProfileData | null> {
    const organizationId = this.authService.getCurrentOrganizationId();
    const userId = this.authService.getCurrentUserId();
    const token = this.authService.getToken();
    const decodedToken = token ? this.authService.getDecodedToken() : null;
    
    console.log('OrganizationProfileResolver: Starting resolution with organizationId:', organizationId);
    console.log('OrganizationProfileResolver: Current userId:', userId);
    console.log('OrganizationProfileResolver: Decoded token info:', decodedToken);
    
    // If we don't have a userId, we can't continue
    if (!userId) {
      console.error('OrganizationProfileResolver: No user ID found, cannot proceed');
      return of(null);
    }
    
    // Get the user information first, as we'll need it regardless
    return this.getUserById(userId).pipe(
      switchMap(user => {
        console.log('OrganizationProfileResolver: Retrieved user info:', user);
        
        // If we have an organizationId, try to get the organization
        if (organizationId) {
          return this.organizationService.getOrganization(organizationId).pipe(
            switchMap(orgResponse => {
              console.log('OrganizationProfileResolver: Response from getOrganization:', orgResponse);
              console.log('OrganizationProfileResolver: Response data type:', typeof orgResponse);
              
              if (orgResponse && orgResponse.data) {
                // We found the organization, return it with the user data
                console.log('OrganizationProfileResolver: Organization found, returning data');
                console.log('OrganizationProfileResolver: Organization data:', orgResponse.data);
                return of({
                  organization: orgResponse.data,
                  user
                });
              } else {
                // No organization data found, try to get by userId
                console.log('OrganizationProfileResolver: No organization data in response, trying by userId');
                return this.tryGetOrganizationByUserId(userId, user);
              }
            }),
            catchError(error => {
              console.error('OrganizationProfileResolver: Error fetching organization:', error);
              return this.tryGetOrganizationByUserId(userId, user);
            })
          );
        } else {
          // No organizationId, try to get by userId
          console.log('OrganizationProfileResolver: No organizationId, trying by userId');
          return this.tryGetOrganizationByUserId(userId, user);
        }
      }),
      catchError(error => {
        console.error('OrganizationProfileResolver: Error in user retrieval:', error);
        
        // Create minimal user from token if available
        const user = decodedToken ? this.createUserFromToken(decodedToken) : {} as User;
        
        // Create a default organization with the user's email if we have it
        const defaultOrg = this.createDefaultOrganization(userId, user.email);
        
        console.log('OrganizationProfileResolver: Returning default data after error');
        return of({
          organization: defaultOrg,
          user
        });
      })
    );
  }
  
  // Try to get organization by user ID
  private tryGetOrganizationByUserId(userId: string, user: User): Observable<OrganizationProfileData> {
    console.log('OrganizationProfileResolver: Attempting to get organization by userId:', userId);
    return this.organizationService.getOrganizationByUserId(userId).pipe(
      map(organization => {
        console.log('OrganizationProfileResolver: Found organization by userId, raw response:', organization);
        console.log('OrganizationProfileResolver: Organization data type:', typeof organization);
        console.log('OrganizationProfileResolver: Organization has properties:', Object.keys(organization));
        
        // Check if we need to unwrap a data property
        const orgData = organization.hasOwnProperty('data') ? (organization as any).data : organization;
        console.log('OrganizationProfileResolver: Final organization data to use:', orgData);
        
        return {
          organization: orgData,
          user
        };
      }),
      catchError(error => {
        console.error('OrganizationProfileResolver: Error fetching organization by userId:', error);
        
        // Create a default organization with the user's email
        const defaultOrg = this.createDefaultOrganization(userId, user.email);
        
        console.log('OrganizationProfileResolver: Created default organization profile');
        return of({
          organization: defaultOrg,
          user
        });
      })
    );
  }
  
  // Helper method to handle parsing the userId and calling getUserById
  private getUserById(userId: string): Observable<User> {
    // Check if userId is a valid number
    const userIdNum = Number(userId);
    if (isNaN(userIdNum)) {
      console.error('OrganizationProfileResolver: Invalid user ID format:', userId);
      // Instead of returning an empty user, create one from the token data
      const token = this.authService.getToken();
      const decodedToken = token ? this.authService.getDecodedToken() : null;
      
      if (decodedToken) {
        return of(this.createUserFromToken(decodedToken));
      }
      return of({} as User);
    }
    return this.userService.getUserById(userIdNum);
  }
  
  // Create a user object from token data
  private createUserFromToken(decodedToken: any): User {
    return {
      id: decodedToken.user_id || '',
      email: decodedToken.sub || '',
      firstName: decodedToken.first_name || '',
      lastName: decodedToken.last_name || '',
      role: decodedToken.role?.replace('ROLE_', '') || 'ORGANIZATION',
      roles: [decodedToken.role?.replace('ROLE_', '') || 'ORGANIZATION'],
      emailVerified: decodedToken.email_verified || false,
      twoFactorEnabled: false,
      accountLocked: false,
      accountExpired: false,
      credentialsExpired: false,
      profilePicture: '',
      lastLoginIp: '',
      lastLoginAt: '',
      questionnaireCompleted: decodedToken.questionnaire_completed || false
    };
  }
  
  // Create a default organization profile
  private createDefaultOrganization(userId: string, email: string = ''): OrganizationProfile {
    return {
      id: '',
      userId: userId,
      name: '',
      description: '',
      email: email,
      phoneNumber: '',
      address: '',
      city: '',
      province: '',
      country: '',
      postalCode: '',
      website: '',
      socialMediaLinks: {},
      focusAreas: [],
      registrationNumber: '',
      type: '',
      category: '',
      size: '',
      coordinates: [0, 0],
      verified: false,
      active: true,
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
      mission: '',
      vision: '',
      documents: [],
      rating: 0,
      profilePicture: '',
      logo: '',
      foundedYear: null,
      acceptingVolunteers: true,
      numberOfRatings: 0,
      totalEventsHosted: 0,
      activeVolunteers: 0,
      totalVolunteerHours: 0,
      impactScore: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageId: ''
    } as unknown as OrganizationProfile;
  }
} 