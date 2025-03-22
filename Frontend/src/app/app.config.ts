import { ApplicationConfig, isDevMode, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withHashLocation, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { AuthEffects } from './store/auth/auth.effects';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { EventEffects } from './store/event/event.effects';
import { AuthService } from './core/services/auth.service';
import { reducers } from './store';
import { VolunteerEffects } from './store/volunteer/volunteer.effects';
import { AdminEffects } from './store/admin/admin.effects';

export function initializeApp(authService: AuthService) {
  return () => {
    authService.checkAuthState();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
      withHashLocation(),
    ),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor
      ])
    ),
    // Root store must be provided directly (no feature modules)
    provideStore(reducers),
    provideEffects([
      AuthEffects,
      EventEffects,
      VolunteerEffects,
      AdminEffects
    ]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      connectInZone: true
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService],
      multi: true
    }
  ]
};
