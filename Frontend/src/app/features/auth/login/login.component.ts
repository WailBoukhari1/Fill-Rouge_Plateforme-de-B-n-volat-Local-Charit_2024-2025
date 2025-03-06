import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';

import * as AuthActions from '../../../store/auth/auth.actions';
import { selectAuthError, selectAuthLoading, selectUser, selectRequiresTwoFactor } from '../../../store/auth/auth.selectors';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCheckboxModule,
    MatStepperModule,
    MatDividerModule,
    RouterLink
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-extrabold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p class="text-gray-600">Sign in to continue to your account</p>
        </div>

        <mat-card class="shadow-lg rounded-lg overflow-hidden">
          <div class="bg-indigo-600 p-4 text-white text-center">
            <h3 class="text-xl font-medium">Local Charity Platform</h3>
          </div>

          <mat-card-content class="p-6">
            <div *ngIf="!showTwoFactorForm">
              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
                <div class="space-y-4">
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Email address</mat-label>
                    <input matInput formControlName="email" type="email" required>
                    <mat-icon matPrefix class="mr-2 text-gray-500">email</mat-icon>
                    <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                      Email is required
                    </mat-error>
                    <mat-error *ngIf="loginForm.get('email')?.hasError('email') || loginForm.get('email')?.hasError('pattern')">
                      Please enter a valid email address (e.g., example&#64;domain.com)
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Password</mat-label>
                    <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" required>
                    <mat-icon matPrefix class="mr-2 text-gray-500">lock</mat-icon>
                    <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                      <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                    </button>
                    <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                      Password is required
                    </mat-error>
                    <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                      Password must be at least 8 characters long
                    </mat-error>
                    <mat-error *ngIf="loginForm.get('password')?.hasError('pattern')">
                      Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character
                    </mat-error>
                  </mat-form-field>
                </div>

                <div *ngIf="error$ | async as error" class="text-red-500 text-sm text-center bg-red-50 p-4 rounded border border-red-200 mb-4">
                  <div class="flex items-center justify-center">
                    <mat-icon class="text-red-500 mr-2">error_outline</mat-icon>
                    <span>{{ error }}</span>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <mat-checkbox formControlName="rememberMe" color="primary" class="text-sm">
                    Remember me
                  </mat-checkbox>

                  <div class="text-sm">
                    <a routerLink="/auth/forgot-password" class="font-medium text-indigo-600 hover:text-indigo-500">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <div>
                  <button mat-raised-button color="primary"
                          class="w-full py-2"
                          type="submit"
                          [disabled]="loginForm.invalid || (loading$ | async)">
                    <div class="flex items-center justify-center">
                      <mat-spinner diameter="20" *ngIf="loading$ | async" class="mr-2"></mat-spinner>
                      <span>Sign in</span>
                    </div>
                  </button>
                </div>
              </form>
            </div>

            <!-- Two-factor authentication form -->
            <div *ngIf="showTwoFactorForm">
              <form [formGroup]="twoFactorForm" (ngSubmit)="onTwoFactorSubmit()" class="space-y-6">
                <div class="text-center mb-4">
                  <mat-icon class="text-5xl text-indigo-600">security</mat-icon>
                  <h3 class="text-xl font-medium mt-2">Two-Factor Authentication</h3>
                  <p class="text-sm text-gray-600 mt-1">
                    Please enter the verification code from your authenticator app.
                  </p>
                </div>

                <div class="space-y-4">
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Verification Code</mat-label>
                    <input matInput formControlName="code" type="text" required maxlength="6" autocomplete="off">
                    <mat-icon matPrefix class="mr-2 text-gray-500">dialpad</mat-icon>
                    <mat-error *ngIf="twoFactorForm.get('code')?.hasError('required')">
                      Verification code is required
                    </mat-error>
                    <mat-error *ngIf="twoFactorForm.get('code')?.hasError('pattern') ||
                                     twoFactorForm.get('code')?.hasError('minlength') ||
                                     twoFactorForm.get('code')?.hasError('maxlength')">
                      Code must be exactly 6 digits
                    </mat-error>
                  </mat-form-field>
                </div>

                <div *ngIf="error$ | async as error" class="text-red-500 text-sm text-center bg-red-50 p-4 rounded border border-red-200 mb-4">
                  <div class="flex items-center justify-center">
                    <mat-icon class="text-red-500 mr-2">error_outline</mat-icon>
                    <span>{{ error }}</span>
                  </div>
                </div>

                <div>
                  <button mat-raised-button color="primary"
                          class="w-full py-2"
                          type="submit"
                          [disabled]="twoFactorForm.invalid || (loading$ | async)">
                    <div class="flex items-center justify-center">
                      <mat-spinner diameter="20" *ngIf="loading$ | async" class="mr-2"></mat-spinner>
                      <span>Verify</span>
                    </div>
                  </button>
                </div>

                <div class="text-center mt-4">
                  <button mat-button type="button" (click)="showTwoFactorForm = false" class="text-gray-600">
                    <mat-icon class="mr-1">arrow_back</mat-icon>
                    Back to Login
                  </button>
                </div>
              </form>
            </div>
          </mat-card-content>

          <mat-divider></mat-divider>

          <div class="p-4 text-center bg-gray-50">
            <p class="text-sm text-gray-600">
              Don't have an account?
              <a routerLink="/auth/register" class="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
                Register here
              </a>
            </p>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    mat-form-field {
      width: 100%;
    }
    .mat-mdc-card {
      border-radius: 8px;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  twoFactorForm: FormGroup;
  hidePassword = true;
  showTwoFactorForm = false;
  error$ = this.store.select(selectAuthError);
  loading$ = this.store.select(selectAuthLoading);
  requiresTwoFactor$ = this.store.select(selectRequiresTwoFactor);

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      rememberMe: [false]
    });

    this.twoFactorForm = this.fb.group({
      code: ['', [
        Validators.required,
        Validators.pattern(/^\d{6}$/),
        Validators.minLength(6),
        Validators.maxLength(6)
      ]]
    });
  }

  ngOnInit(): void {
    // Clear any existing auth errors when component initializes
    this.store.dispatch(AuthActions.loginFailure({ error: '' }));

    // Subscribe to user state to handle email verification and 2FA
    this.store.select(selectUser).pipe(
      filter(user => !!user),
      take(1)
    ).subscribe(user => {
      if (user && !user.emailVerified) {
        // User exists but email is not verified
        this.error$ = this.store.select(selectAuthError);
      }

      if (user && user.twoFactorEnabled) {
        // User has 2FA enabled, show the 2FA form
        this.showTwoFactorForm = true;
      }
    });

    // Subscribe to requiresTwoFactor state
    this.requiresTwoFactor$.subscribe(requiresTwoFactor => {
      if (requiresTwoFactor) {
        this.showTwoFactorForm = true;
        // Store the email and password for later use with the 2FA code
        localStorage.setItem('temp_email', this.loginForm.get('email')?.value);
        localStorage.setItem('temp_password', this.loginForm.get('password')?.value);
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.store.dispatch(AuthActions.login({ email, password }));

      // Subscribe to errors to provide more user-friendly messages
      this.error$.pipe(
        filter(error => !!error),
        take(1)
      ).subscribe(error => {
        if (error) {
          let userFriendlyError = error;

          // Transform backend errors into user-friendly messages
          if (error.includes('Bad credentials')) {
            userFriendlyError = 'Invalid email or password. Please try again.';
          } else if (error.includes('locked')) {
            userFriendlyError = 'Your account is locked. Please contact support.';
          } else if (error.includes('disabled')) {
            userFriendlyError = 'Your account is disabled. Please verify your email.';
          } else if (error.includes('server')) {
            userFriendlyError = 'Server error. Please try again later.';
          }

          // Update the error message
          this.store.dispatch(AuthActions.loginFailure({ error: userFriendlyError }));
        }
      });
    }
  }

  onTwoFactorSubmit(): void {
    if (this.twoFactorForm.valid) {
      const { code } = this.twoFactorForm.value;

      // Get the stored email and password
      const email = localStorage.getItem('temp_email') || this.loginForm.get('email')?.value;
      const password = localStorage.getItem('temp_password') || this.loginForm.get('password')?.value;

      // Dispatch login action with 2FA code
      this.store.dispatch(AuthActions.login({
        email,
        password,
        twoFactorCode: code
      }));

      // Clear the stored credentials
      localStorage.removeItem('temp_email');
      localStorage.removeItem('temp_password');
    }
  }
}
