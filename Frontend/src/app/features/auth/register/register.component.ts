import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';

import * as AuthActions from '../../../store/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
    RouterLink
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-extrabold text-gray-900 mb-2">
            Join Our Community
          </h2>
          <p class="text-gray-600">Create an account to start making a difference</p>
        </div>

        <mat-card class="shadow-lg rounded-lg overflow-hidden">
          <div class="bg-indigo-600 p-4 text-white text-center">
            <h3 class="text-xl font-medium">Local Charity Platform</h3>
          </div>

          <mat-card-content class="p-6">
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <mat-form-field class="w-full">
                  <mat-label>First Name</mat-label>
                  <input matInput formControlName="firstName" required>
                  <mat-icon matPrefix class="mr-2 text-gray-500">person</mat-icon>
                  <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')">
                    First name is required
                  </mat-error>
                  <mat-error *ngIf="registerForm.get('firstName')?.hasError('minlength')">
                    First name must be at least 2 characters
                  </mat-error>
                </mat-form-field>

                <mat-form-field class="w-full">
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="lastName" required>
                  <mat-icon matPrefix class="mr-2 text-gray-500">person</mat-icon>
                  <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')">
                    Last name is required
                  </mat-error>
                  <mat-error *ngIf="registerForm.get('lastName')?.hasError('minlength')">
                    Last name must be at least 2 characters
                  </mat-error>
                </mat-form-field>
              </div>

              <mat-form-field class="w-full">
                <mat-label>Email address</mat-label>
                <input matInput formControlName="email" type="email" required>
                <mat-icon matPrefix class="mr-2 text-gray-500">email</mat-icon>
                <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                  Please enter a valid email address
                </mat-error>
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Password</mat-label>
                <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" required>
                <mat-icon matPrefix class="mr-2 text-gray-500">lock</mat-icon>
                <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                  <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                  Password is required
                </mat-error>
                <mat-error *ngIf="registerForm.get('password')?.hasError('pattern')">
                  Password must include uppercase, lowercase, number, and special character
                </mat-error>
                <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                  Password must be at least 8 characters
                </mat-error>
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Confirm Password</mat-label>
                <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" formControlName="confirmPassword" required>
                <mat-icon matPrefix class="mr-2 text-gray-500">lock</mat-icon>
                <button mat-icon-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword" type="button">
                  <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                  Please confirm your password
                </mat-error>
                <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">
                  Passwords do not match
                </mat-error>
              </mat-form-field>

              <div *ngIf="error$ | async as error" 
                   class="text-red-500 text-sm text-center bg-red-50 p-4 rounded border border-red-200 mb-4">
                <div class="flex items-center justify-center">
                  <mat-icon class="text-red-500 mr-2">error_outline</mat-icon>
                  <span>{{ error }}</span>
                </div>
              </div>

              <div>
                <button mat-raised-button color="primary"
                        class="w-full py-2"
                        type="submit"
                        [disabled]="registerForm.invalid || (loading$ | async)">
                  <div class="flex items-center justify-center">
                    <mat-spinner diameter="20" *ngIf="loading$ | async" class="mr-2"></mat-spinner>
                    <span>{{ (loading$ | async) ? 'Creating account...' : 'Create account' }}</span>
                  </div>
                </button>
              </div>
            </form>
          </mat-card-content>

          <mat-divider></mat-divider>

          <div class="p-4 text-center bg-gray-50">
            <p class="text-sm text-gray-600">
              Already have an account?
              <a routerLink="/auth/login" class="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
                Sign in here
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
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  error$ = this.store.select(selectAuthError);
  loading$ = this.store.select(selectAuthLoading);

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
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
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    
    if (password === confirmPassword) {
      return null;
    }
    
    return { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const { firstName, lastName, email, password, confirmPassword } = this.registerForm.value;
      
      // Extra validation before submitting
      if (!email || email.trim() === '') {
        this.registerForm.get('email')?.setErrors({ 'required': true });
        this.registerForm.get('email')?.markAsTouched();
        return;
      }
      
      this.store.dispatch(AuthActions.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        confirmPassword
      }));
    } else {
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
