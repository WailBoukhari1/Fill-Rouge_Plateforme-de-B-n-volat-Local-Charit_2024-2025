import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

import * as AuthActions from '../../../store/auth/auth.actions';
import { selectAuthError, selectAuthLoading, selectUser } from '../../../store/auth/auth.selectors';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>

        <mat-card>
          <mat-card-content>
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
              <div class="rounded-md shadow-sm space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <mat-form-field>
                    <mat-label>First Name</mat-label>
                    <input matInput formControlName="firstName" required>
                    <mat-error *ngIf="registerForm.get('firstName')?.errors?.['required']">
                      First name is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Last Name</mat-label>
                    <input matInput formControlName="lastName" required>
                    <mat-error *ngIf="registerForm.get('lastName')?.errors?.['required']">
                      Last name is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <mat-form-field class="w-full">
                  <mat-label>Email address</mat-label>
                  <input matInput formControlName="email" type="email" required>
                  <mat-error *ngIf="registerForm.get('email')?.errors?.['required']">
                    Email is required
                  </mat-error>
                  <mat-error *ngIf="registerForm.get('email')?.errors?.['email']">
                    Please enter a valid email
                  </mat-error>
                </mat-form-field>

                <mat-form-field class="w-full">
                  <mat-label>Password</mat-label>
                  <input matInput formControlName="password" type="password" required>
                  <mat-error *ngIf="registerForm.get('password')?.errors?.['required']">
                    Password is required
                  </mat-error>
                  <mat-error *ngIf="registerForm.get('password')?.errors?.['minlength']">
                    Password must be at least 8 characters
                  </mat-error>
                </mat-form-field>

                <mat-form-field class="w-full">
                  <mat-label>Role</mat-label>
                  <mat-select formControlName="role" required (selectionChange)="onRoleChange()">
                    <mat-option value="ORGANIZATION">Organization</mat-option>
                    <mat-option value="VOLUNTEER">Volunteer</mat-option>
                  </mat-select>
                  <mat-error *ngIf="registerForm.get('role')?.errors?.['required']">
                    Role is required
                  </mat-error>
                </mat-form-field>

                <!-- Organization fields - only shown when role is ORGANIZATION -->
                <div *ngIf="registerForm.get('role')?.value === 'ORGANIZATION'" class="space-y-4">
                  <mat-form-field class="w-full">
                    <mat-label>Organization Name</mat-label>
                    <input matInput formControlName="organizationName" required>
                    <mat-error *ngIf="registerForm.get('organizationName')?.errors?.['required']">
                      Organization name is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field class="w-full">
                    <mat-label>Organization Website</mat-label>
                    <input matInput formControlName="organizationWebsite">
                  </mat-form-field>

                  <mat-form-field class="w-full">
                    <mat-label>Organization Description</mat-label>
                    <textarea matInput formControlName="organizationDescription" rows="3"></textarea>
                  </mat-form-field>
                </div>
              </div>

              <div *ngIf="error$ | async as error" class="text-red-500 text-sm text-center">
                {{ error }}
              </div>

              <div>
                <button mat-raised-button color="primary"
                        class="w-full"
                        type="submit"
                        [disabled]="registerForm.invalid || (loading$ | async)">
                  <mat-spinner diameter="20" *ngIf="loading$ | async"></mat-spinner>
                  <span *ngIf="!(loading$ | async)">Register</span>
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <div class="text-center">
          <p class="mt-2 text-sm text-gray-600">
            Already have an account?
            <a routerLink="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in here
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
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  error$ = this.store.select(selectAuthError);
  loading$ = this.store.select(selectAuthLoading);

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['', Validators.required],
      organizationName: [''],
      organizationWebsite: [''],
      organizationDescription: ['']
    });
  }

  ngOnInit(): void {
    // Clear any existing auth errors when component initializes
    this.store.dispatch(AuthActions.registerFailure({ error: '' }));

    // Subscribe to user state to handle redirection after registration
    this.store.select(selectUser).pipe(
      filter(user => !!user),
      take(1)
    ).subscribe(user => {
      if (user && !user.emailVerified) {
        this.router.navigate(['/auth/verify-email'], {
          queryParams: { email: user.email }
        });
      }
    });
  }

  onRoleChange(): void {
    const role = this.registerForm.get('role')?.value;
    const organizationNameControl = this.registerForm.get('organizationName');

    if (role === 'ORGANIZATION') {
      organizationNameControl?.setValidators([Validators.required]);
    } else {
      organizationNameControl?.clearValidators();
    }

    organizationNameControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      const registerData = {
        email: formValue.email,
        password: formValue.password,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        role: formValue.role
      };

      // Add organization fields if role is ORGANIZATION
      if (formValue.role === 'ORGANIZATION') {
        Object.assign(registerData, {
          organizationName: formValue.organizationName,
          organizationWebsite: formValue.organizationWebsite,
          organizationDescription: formValue.organizationDescription
        });
      }

      this.store.dispatch(AuthActions.register(registerData));
    }
  }
}
