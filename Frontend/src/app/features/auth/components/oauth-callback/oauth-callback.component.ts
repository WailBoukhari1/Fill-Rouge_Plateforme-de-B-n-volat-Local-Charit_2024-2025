import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as AuthActions from '../../../../store/auth/auth.actions';
import { AuthState } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <mat-spinner diameter="48" class="mx-auto"></mat-spinner>
        <p class="mt-4 text-gray-600">Processing your login...</p>
      </div>
    </div>
  `
})
export class OAuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<{ auth: AuthState }>
  ) {}

  ngOnInit(): void {
    // Get the provider from the URL path
    const provider = this.route.snapshot.paramMap.get('provider');
    // Get the authorization code from query parameters
    const code = this.route.snapshot.queryParamMap.get('code');

    if (provider && code) {
      this.store.dispatch(AuthActions.oAuthLogin({ provider, code }));
    } else {
      // If no code is present, redirect to login
      this.router.navigate(['/auth/login']);
    }
  }
} 