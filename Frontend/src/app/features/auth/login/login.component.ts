import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as AuthActions from '../../../store/auth/auth.actions';
import { selectAuthError, selectAuthLoading, selectUser, selectRequiresTwoFactor } from '../../../store/auth/auth.selectors';

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
    MatSnackBarModule,
    RouterLink,
    AsyncPipe
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
                  <mat-form-field class="w-full">
                    <mat-label>Email address</mat-label>
                    <input matInput formControlName="email" type="email" required 
                           [class.border-red-500]="isFieldInvalid('email')"
                           (blur)="validateField('email')">
                    <mat-icon matPrefix class="mr-2 text-gray-500">email</mat-icon>
                    <mat-error *ngIf="getErrorMessage('email')" class="text-sm">
                      {{ getErrorMessage('email') }}
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field class="w-full">
                    <mat-label>Password</mat-label>
                    <input matInput [type]="hidePassword ? 'password' : 'text'" 
                           formControlName="password" required
                           [class.border-red-500]="isFieldInvalid('password')"
                           (blur)="validateField('password')">
                    <mat-icon matPrefix class="mr-2 text-gray-500">lock</mat-icon>
                    <button mat-icon-button matSuffix (click)="togglePasswordVisibility($event)" type="button">
                      <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                    </button>
                    <mat-error *ngIf="getErrorMessage('password')" class="text-sm">
                      {{ getErrorMessage('password') }}
                    </mat-error>
                  </mat-form-field>
                </div>

                <div *ngIf="error$ | async as error" 
                     class="text-red-500 text-sm text-center bg-red-50 p-4 rounded border border-red-200 mb-4 animate-fade-in">
                  <div class="flex items-center justify-center mb-2">
                    <mat-icon class="text-red-500 mr-2">error_outline</mat-icon>
                    <span class="font-medium">{{ error }}</span>
                  </div>
                  
                  <ng-container *ngIf="shouldShowRegisterLink(error)">
                    <div class="mt-3 p-3 bg-white rounded border border-indigo-200">
                      <p class="text-gray-700 mb-2">New to our platform?</p>
                      <a routerLink="/auth/register" 
                         class="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                        <mat-icon class="mr-1 text-sm">person_add</mat-icon>
                        Create an account
                      </a>
                    </div>
                  </ng-container>

                  <ng-container *ngIf="shouldShowForgotPasswordLink(error)">
                    <div class="mt-3">
                      <a routerLink="/auth/forgot-password" 
                         class="text-indigo-600 hover:text-indigo-700 font-medium flex items-center justify-center">
                        <mat-icon class="mr-1 text-sm">lock_reset</mat-icon>
                        Reset your password
                      </a>
                    </div>
                  </ng-container>
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
                      <span>{{ (loading$ | async) ? 'Signing in...' : 'Sign in' }}</span>
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
                  <mat-form-field class="w-full">
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
    .animate-fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .border-red-500 {
      border-color: #ef4444;
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  twoFactorForm!: FormGroup;
  hidePassword = true;
  showTwoFactorForm = false;
  error$ = this.store.select(selectAuthError);
  loading$ = this.store.select(selectAuthLoading);
  requiresTwoFactor$ = this.store.select(selectRequiresTwoFactor);
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  private initializeForms(): void {
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
    this.store.dispatch(AuthActions.loginFailure({ error: '' }));
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    this.error$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(error => {
      if (error) {
        this.showErrorSnackbar(error);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  validateField(fieldName: string): void {
    const field = this.loginForm.get(fieldName);
    if (field) {
      field.markAsTouched();
      if (field.invalid) {
        this.showErrorSnackbar(this.getErrorMessage(fieldName));
      }
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }

    if (fieldName === 'email') {
      if (field.hasError('email') || field.hasError('pattern')) {
        return 'Please enter a valid email address';
      }
    }

    if (fieldName === 'password') {
      if (field.hasError('minlength')) {
        return 'Password must be at least 8 characters long';
      }
      if (field.hasError('pattern')) {
        return 'Password must include uppercase, lowercase, number, and special character';
      }
    }

    return '';
  }

  togglePasswordVisibility(event: Event): void {
    event.preventDefault();
    this.hidePassword = !this.hidePassword;
  }

  shouldShowRegisterLink(error: string): boolean {
    return error.toLowerCase().includes('account not found') || 
           error.toLowerCase().includes('user not found') ||
           error.toLowerCase().includes('register');
  }

  shouldShowForgotPasswordLink(error: string): boolean {
    return error.toLowerCase().includes('invalid') || 
           error.toLowerCase().includes('incorrect password') ||
           error.toLowerCase().includes('password');
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      // Clear any existing errors
      this.store.dispatch(AuthActions.loginFailure({ error: '' }));
      
      // Log form values for debugging
      console.log('Form values:', this.loginForm.value);
      
      const { email, password } = this.loginForm.value;
      
      // Trim whitespace from email and password
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      
      // Basic validation before dispatch
      if (!trimmedEmail || !trimmedPassword) {
        this.showErrorSnackbar('Please fill in all required fields');
        return;
      }
      
      // Dispatch login action
      this.store.dispatch(AuthActions.login({ 
        email: trimmedEmail, 
        password: trimmedPassword 
      }));
      
      // Subscribe to error state for additional handling
      this.error$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(error => {
        if (error) {
          // Show error in snackbar
          this.showErrorSnackbar(error);
          
          // Log for debugging
          console.error('Login error occurred:', error);
          
          // Reset form if it's an authentication error
          if (error.toLowerCase().includes('invalid') || 
              error.toLowerCase().includes('incorrect')) {
            this.loginForm.get('password')?.reset();
            this.loginForm.get('password')?.markAsUntouched();
          }
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        if (control) {
          control.markAsTouched();
          if (control.errors) {
            console.log(`Validation errors for ${key}:`, control.errors);
          }
        }
      });
      
      // Show general error message
      this.showErrorSnackbar('Please fix the validation errors before submitting');
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

  private showErrorSnackbar(message: string): void {
    // Dismiss any existing snackbar
    this.snackBar.dismiss();
    
    // Show new error message
    this.snackBar.open(message, 'Close', {
      duration: 8000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar'],
      data: { error: true }
    });
  }
}
