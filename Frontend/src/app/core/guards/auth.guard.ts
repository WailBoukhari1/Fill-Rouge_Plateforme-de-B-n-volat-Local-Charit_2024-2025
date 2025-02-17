import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take, tap, switchMap } from 'rxjs/operators';
import { selectUser, selectIsAuthenticated } from '../../store/auth/auth.selectors';
import * as AuthActions from '../../store/auth/auth.actions';
import { AuthService } from '../services/auth.service';

export const AuthGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const store = inject(Store);
  const authService = inject(AuthService);

  return store.select(selectIsAuthenticated).pipe(
    take(1),
    tap(isAuthenticated => {
      if (!isAuthenticated) {
        const token = authService.getDecodedToken();
        if (token) {
          store.dispatch(AuthActions.loadStoredUser());
        } else {
          router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url }});
        }
      }
    }),
    switchMap(() => store.select(selectUser)),
    take(1),
    map(user => {
      if (!user) {
        router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url }});
        return false;
      }

      // Check if route has role restrictions
      if (route.data['roles'] && !route.data['roles'].includes(user.role)) {
        router.navigate(['/dashboard']);
        return false;
      }

      return true;
    })
  );
}; 