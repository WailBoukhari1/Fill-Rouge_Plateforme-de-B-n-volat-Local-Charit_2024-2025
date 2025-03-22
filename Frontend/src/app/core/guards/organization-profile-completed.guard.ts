import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, map, take, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUser } from '../../store/auth/auth.selectors';
import { AuthService } from '../services/auth.service';
import { OrganizationService } from '../services/organization.service';
import { catchError, switchMap } from 'rxjs/operators';

// TEMPORARY DEBUG FLAG - set to true to bypass this guard
// IMPORTANT: Set to false before deploying to production
const BYPASS_GUARD = true;

@Injectable({
  providedIn: 'root'
})
export class OrganizationProfileCompletedGuard {
  constructor(
    private store: Store,
    private authService: AuthService,
    private organizationService: OrganizationService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    // If debug bypass is enabled, always allow access
    if (BYPASS_GUARD) {
      console.log('DEBUG: Guard bypassed with BYPASS_GUARD flag');
      return of(true);
    }
    
    return this.store.select(selectUser).pipe(
      take(1),
      switchMap(user => {
        if (!user || user.role !== 'ORGANIZATION') {
          return of(true); // Not our concern if not an organization
        }

        const organizationId = this.authService.getCurrentOrganizationId();
        if (!organizationId) {
          console.error('No organization ID found');
          return of(this.router.createUrlTree(['/dashboard']));
        }

        return this.organizationService.getOrganization(organizationId).pipe(
          map(response => {
            const profile = response.data;
            
            // Additional logging to debug response structure
            console.log('Guard - Raw API response:', response);
            
            // Log the actual profile data we're checking
            console.log('Guard - Organization profile data to check:', {
              id: profile?.id,
              name: profile?.name,
              description: profile?.description,
              mission: profile?.mission,
              phoneNumber: profile?.phoneNumber,
              address: profile?.address,
              city: profile?.city,
              province: profile?.province,
              country: profile?.country,
              type: profile?.type,
              category: profile?.category,
              size: profile?.size,
              focusAreasLength: profile?.focusAreas?.length,
              registrationNumber: profile?.registrationNumber
            });
            
            // Check if all required fields are filled with more robust checks
            const isProfileComplete = !!(
              profile?.id && 
              profile?.name && profile?.name.trim() !== '' &&
              profile?.description && profile?.description.trim() !== '' &&
              profile?.mission && profile?.mission.trim() !== '' &&
              profile?.phoneNumber && profile?.phoneNumber.trim() !== '' &&
              profile?.address && profile?.address.trim() !== '' &&
              profile?.city && profile?.city.trim() !== '' &&
              profile?.province && profile?.province.trim() !== '' &&
              profile?.country && profile?.country.trim() !== '' &&
              profile?.type && profile?.type.trim() !== '' &&
              profile?.category && profile?.category.trim() !== '' &&
              profile?.size && profile?.size.trim() !== '' &&
              profile?.focusAreas && Array.isArray(profile.focusAreas) && profile.focusAreas.length > 0 &&
              profile?.registrationNumber && profile?.registrationNumber.trim() !== ''
            );

            // Log more detailed information for debugging
            console.log('Guard - Profile complete status:', isProfileComplete);
            if (!isProfileComplete) {
              const missingFields = [];
              if (!profile?.name || profile.name.trim() === '') missingFields.push('name');
              if (!profile?.description || profile.description.trim() === '') missingFields.push('description');
              if (!profile?.mission || profile.mission.trim() === '') missingFields.push('mission');
              if (!profile?.phoneNumber || profile.phoneNumber.trim() === '') missingFields.push('phoneNumber');
              if (!profile?.address || profile.address.trim() === '') missingFields.push('address');
              if (!profile?.city || profile.city.trim() === '') missingFields.push('city');
              if (!profile?.province || profile.province.trim() === '') missingFields.push('province');
              if (!profile?.country || profile.country.trim() === '') missingFields.push('country');
              if (!profile?.type || profile.type.trim() === '') missingFields.push('type');
              if (!profile?.category || profile.category.trim() === '') missingFields.push('category');
              if (!profile?.size || profile.size.trim() === '') missingFields.push('size');
              if (!profile?.focusAreas || !Array.isArray(profile.focusAreas) || profile.focusAreas.length === 0) missingFields.push('focusAreas');
              if (!profile?.registrationNumber || profile.registrationNumber.trim() === '') missingFields.push('registrationNumber');
              console.log('Guard - Missing fields:', missingFields);
            }

            if (isProfileComplete) {
              return true; // Allow navigation
            } else {
              console.log('Organization profile incomplete, redirecting to profile page');
              return this.router.createUrlTree(['/organization/profile']);
            }
          }),
          catchError(error => {
            console.error('Error checking organization profile:', error);
            return of(this.router.createUrlTree(['/organization/profile']));
          })
        );
      })
    );
  }
} 