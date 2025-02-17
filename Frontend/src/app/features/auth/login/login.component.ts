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
import { RouterLink } from '@angular/router';

import * as AuthActions from '../../../store/auth/auth.actions';
import { selectAuthError, selectAuthLoading, selectUser } from '../../../store/auth/auth.selectors';
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
    RouterLink
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        <mat-card>
          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
              <div class="rounded-md shadow-sm space-y-4">
                <mat-form-field class="w-full">
                  <mat-label>Email address</mat-label>
                  <input matInput formControlName="email" type="email" required>
                  <mat-error *ngIf="loginForm.get('email')?.errors?.['required']">
                    Email is required
                  </mat-error>
                  <mat-error *ngIf="loginForm.get('email')?.errors?.['email']">
                    Please enter a valid email
                  </mat-error>
                </mat-form-field>

                <mat-form-field class="w-full">
                  <mat-label>Password</mat-label>
                  <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" required>
                  <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                    <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                  </button>
                  <mat-error *ngIf="loginForm.get('password')?.errors?.['required']">
                    Password is required
                  </mat-error>
                </mat-form-field>
              </div>

              <div *ngIf="error$ | async as error" class="text-red-500 text-sm text-center">
                {{ error }}
              </div>

              <div class="flex items-center justify-between">
                <mat-checkbox formControlName="rememberMe" color="primary">
                  Remember me
                </mat-checkbox>

                <div class="text-sm">
                  <a routerLink="/auth/forgot-password" class="font-medium text-indigo-600 hover:text-indigo-500">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <button mat-raised-button color="primary" 
                        class="w-full"
                        type="submit"
                        [disabled]="loginForm.invalid || (loading$ | async)">
                  <mat-spinner diameter="20" *ngIf="loading$ | async"></mat-spinner>
                  <span *ngIf="!(loading$ | async)">Sign in</span>
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <div class="text-center">
          <p class="mt-2 text-sm text-gray-600">
            Don't have an account?
            <a routerLink="/auth/register" class="font-medium text-indigo-600 hover:text-indigo-500">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  error$ = this.store.select(selectAuthError);
  loading$ = this.store.select(selectAuthLoading);

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Clear any existing auth errors when component initializes
    this.store.dispatch(AuthActions.loginFailure({ error: '' }));

    // Subscribe to user state to handle email verification
    this.store.select(selectUser).pipe(
      filter(user => !!user),
      take(1)
    ).subscribe(user => {
      if (user && !user.emailVerified) {
        // User exists but email is not verified
        this.error$ = this.store.select(selectAuthError);
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.store.dispatch(AuthActions.login({ email, password }));
    }
  }
} 