import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { selectUserRole } from '../../store/auth/auth.selectors';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private store: Store, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const allowedRoles = route.data['roles'] as string[];

    return this.store.select(selectUserRole).pipe(
      take(1),
      map((userRole) => {
        if (!userRole) {
          this.router.navigate(['/auth/login']);
          return false;
        }

        if (allowedRoles.includes(userRole)) {
          return true;
        }

        // If roles don't match, redirect to the appropriate profile page
        switch (userRole) {
          case 'VOLUNTEER':
            this.router.navigate(['/volunteer/profile']);
            break;
          case 'ORGANIZATION':
            this.router.navigate(['/organization/profile']);
            break;
          case 'ADMIN':
            this.router.navigate(['/users']);
            break;
          default:
            this.router.navigate(['/']);
        }
        return false;
      })
    );
  }
}
