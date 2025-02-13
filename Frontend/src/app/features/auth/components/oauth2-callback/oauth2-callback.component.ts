import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../../store/auth/auth.actions';
import { AuthUser } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-oauth2-callback',
  template: '<div>Processing login...</div>',
  standalone: true
})
export class OAuth2CallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        // Create a verified AuthUser object for OAuth users
        const user: AuthUser = {
          email: '',
          roles: ['VOLUNTEER'], // Default role for OAuth users
          emailVerified: true // OAuth users are automatically verified
        };

        this.store.dispatch(AuthActions.oAuthSuccess({
          accessToken: token,
          refreshToken: token,
          user: user
        }));
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }
} 