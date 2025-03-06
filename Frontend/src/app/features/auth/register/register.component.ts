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
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';

import * as AuthActions from '../../../store/auth/auth.actions';
import { selectAuthError, selectAuthLoading, selectUser } from '../../../store/auth/auth.selectors';
import { filter, take } from 'rxjs/operators';
import { UserRole } from '../../../core/models/auth.models';

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
    MatIconModule,
    MatStepperModule,
    MatDividerModule,
    RouterLink
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl w-full">
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
            <mat-stepper [linear]="true" #stepper>
              <!-- Step 1: Account Information -->
              <mat-step [stepControl]="accountFormGroup">
                <ng-template matStepLabel>Account</ng-template>
                <form [formGroup]="accountFormGroup" class="py-4 space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>First Name</mat-label>
                      <input matInput formControlName="firstName" required>
                      <mat-icon matPrefix class="mr-2 text-gray-500">person</mat-icon>
                      <mat-error *ngIf="accountFormGroup.get('firstName')?.hasError('required')">
                        First name is required
                      </mat-error>
                      <mat-error *ngIf="accountFormGroup.get('firstName')?.hasError('minlength')">
                        First name must be at least 2 characters
                      </mat-error>
                      <mat-error *ngIf="accountFormGroup.get('firstName')?.hasError('maxlength')">
                        First name cannot exceed 50 characters
                      </mat-error>
                      <mat-error *ngIf="accountFormGroup.get('firstName')?.hasError('pattern')">
                        First name can only contain letters, spaces, hyphens, and apostrophes
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Last Name</mat-label>
                      <input matInput formControlName="lastName" required>
                      <mat-icon matPrefix class="mr-2 text-gray-500">person</mat-icon>
                      <mat-error *ngIf="accountFormGroup.get('lastName')?.hasError('required')">
                        Last name is required
                      </mat-error>
                      <mat-error *ngIf="accountFormGroup.get('lastName')?.hasError('minlength')">
                        Last name must be at least 2 characters
                      </mat-error>
                      <mat-error *ngIf="accountFormGroup.get('lastName')?.hasError('maxlength')">
                        Last name cannot exceed 50 characters
                      </mat-error>
                      <mat-error *ngIf="accountFormGroup.get('lastName')?.hasError('pattern')">
                        Last name can only contain letters, spaces, hyphens, and apostrophes
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Email address</mat-label>
                    <input matInput formControlName="email" type="email" required>
                    <mat-icon matPrefix class="mr-2 text-gray-500">email</mat-icon>
                    <mat-error *ngIf="accountFormGroup.get('email')?.hasError('required')">
                      Email is required
                    </mat-error>
                    <mat-error *ngIf="accountFormGroup.get('email')?.hasError('email') || accountFormGroup.get('email')?.hasError('pattern')">
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
                    <mat-error *ngIf="accountFormGroup.get('password')?.hasError('required')">
                      Password is required
                    </mat-error>
                    <mat-error *ngIf="accountFormGroup.get('password')?.hasError('minlength')">
                      Password must be at least 8 characters long
                    </mat-error>
                    <mat-error *ngIf="accountFormGroup.get('password')?.hasError('pattern')">
                      Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character
                    </mat-error>
                  </mat-form-field>

                  <div class="flex justify-end">
                    <button mat-raised-button color="primary" matStepperNext [disabled]="accountFormGroup.invalid">
                      Next <mat-icon>arrow_forward</mat-icon>
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- Step 2: Role Selection -->
              <mat-step [stepControl]="roleFormGroup">
                <ng-template matStepLabel>Role</ng-template>
                <form [formGroup]="roleFormGroup" class="py-4 space-y-4">
                  <div class="text-center mb-4">
                    <h3 class="text-lg font-medium">How would you like to participate?</h3>
                    <p class="text-sm text-gray-600">Choose your role in our community</p>
                  </div>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Role</mat-label>
                    <mat-select formControlName="role" required (selectionChange)="onRoleChange()">
                      <mat-option [value]="UserRole.VOLUNTEER">
                        <div class="flex items-center">
                          <mat-icon class="mr-2">volunteer_activism</mat-icon>
                          <span>Volunteer</span>
                        </div>
                      </mat-option>
                      <mat-option [value]="UserRole.ORGANIZATION">
                        <div class="flex items-center">
                          <mat-icon class="mr-2">business</mat-icon>
                          <span>Organization</span>
                        </div>
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="roleFormGroup.get('role')?.errors?.['required']">
                      Role is required
                    </mat-error>
                  </mat-form-field>

                  <div class="flex justify-between">
                    <button mat-button matStepperPrevious>
                      <mat-icon>arrow_back</mat-icon> Back
                    </button>
                    <button mat-raised-button color="primary" matStepperNext [disabled]="roleFormGroup.invalid">
                      Next <mat-icon>arrow_forward</mat-icon>
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- Step 3: Role-specific Information -->
              <mat-step [stepControl]="roleSpecificFormGroup">
                <ng-template matStepLabel>Details</ng-template>
                <form [formGroup]="roleSpecificFormGroup" class="py-4 space-y-4">
                  <!-- Organization fields -->
                  <div *ngIf="isOrganization()" class="space-y-4">
                    <div class="text-center mb-4">
                      <h3 class="text-lg font-medium">Organization Details</h3>
                      <p class="text-sm text-gray-600">Tell us about your organization</p>
                    </div>

                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Organization Name</mat-label>
                      <input matInput formControlName="organizationName" required>
                      <mat-icon matPrefix class="mr-2 text-gray-500">business</mat-icon>
                      <mat-error *ngIf="roleSpecificFormGroup.get('organizationName')?.errors?.['required']">
                        Organization name is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Organization Website</mat-label>
                      <input matInput formControlName="organizationWebsite">
                      <mat-icon matPrefix class="mr-2 text-gray-500">language</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Organization Description</mat-label>
                      <textarea matInput formControlName="organizationDescription" rows="3"></textarea>
                      <mat-icon matPrefix class="mr-2 text-gray-500">description</mat-icon>
                    </mat-form-field>
                  </div>

                  <!-- Volunteer fields -->
                  <div *ngIf="isVolunteer()" class="space-y-4">
                    <div class="text-center mb-4">
                      <h3 class="text-lg font-medium">Volunteer Details</h3>
                      <p class="text-sm text-gray-600">Tell us a bit about yourself</p>
                    </div>

                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Phone Number</mat-label>
                      <input matInput formControlName="phoneNumber">
                      <mat-icon matPrefix class="mr-2 text-gray-500">phone</mat-icon>
                    </mat-form-field>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>City</mat-label>
                        <input matInput formControlName="city">
                        <mat-icon matPrefix class="mr-2 text-gray-500">location_city</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Country</mat-label>
                        <input matInput formControlName="country">
                        <mat-icon matPrefix class="mr-2 text-gray-500">public</mat-icon>
                      </mat-form-field>
                    </div>
                  </div>

                  <div *ngIf="error$ | async as error" class="text-red-500 text-sm text-center bg-red-50 p-4 rounded border border-red-200 mb-4">
                    <div class="flex items-center justify-center">
                      <mat-icon class="text-red-500 mr-2">error_outline</mat-icon>
                      <span>{{ error }}</span>
                    </div>
                  </div>

                  <div class="flex justify-between">
                    <button mat-button matStepperPrevious>
                      <mat-icon>arrow_back</mat-icon> Back
                    </button>
                    <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="isFormInvalid() || (loading$ | async)">
                      <div class="flex items-center">
                        <mat-spinner diameter="20" *ngIf="loading$ | async" class="mr-2"></mat-spinner>
                        <span>Register</span>
                      </div>
                    </button>
                  </div>
                </form>
              </mat-step>
            </mat-stepper>
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
  accountFormGroup!: FormGroup;
  roleFormGroup!: FormGroup;
  roleSpecificFormGroup!: FormGroup;

  hidePassword = true;
  error$ = this.store.select(selectAuthError);
  loading$ = this.store.select(selectAuthLoading);

  // Expose UserRole enum to the template
  UserRole = UserRole;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router
  ) {
    this.initFormGroups();
  }

  ngOnInit(): void {
    // Clear any existing auth errors when component initializes
    this.store.dispatch(AuthActions.loginFailure({ error: '' }));
  }

  initFormGroups(): void {
    // Step 1: Account Information
    this.accountFormGroup = this.fb.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z\s\-']+$/)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z\s\-']+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]]
    });

    // Step 2: Role Selection
    this.roleFormGroup = this.fb.group({
      role: ['', Validators.required]
    });

    // Step 3: Role-specific Information
    this.roleSpecificFormGroup = this.fb.group({
      // Organization fields
      organizationName: ['', [Validators.minLength(2), Validators.maxLength(100)]],
      organizationWebsite: ['', Validators.pattern(/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/)],
      organizationDescription: ['', [Validators.minLength(10), Validators.maxLength(500)]],

      // Volunteer fields
      phoneNumber: ['', Validators.pattern(/^\+?[0-9\s\-\(\)]{8,20}$/)],
      city: ['', [Validators.minLength(2), Validators.maxLength(50)]],
      country: ['', [Validators.minLength(2), Validators.maxLength(50)]]
    });
  }

  onRoleChange(): void {
    const role = this.roleFormGroup.get('role')?.value;

    // Update validators based on role
    if (role === UserRole.ORGANIZATION) {
      this.roleSpecificFormGroup.get('organizationName')?.setValidators([Validators.required]);
    } else {
      this.roleSpecificFormGroup.get('organizationName')?.clearValidators();
    }

    // Update validation status
    this.roleSpecificFormGroup.get('organizationName')?.updateValueAndValidity();
  }

  isOrganization(): boolean {
    return this.roleFormGroup.get('role')?.value === UserRole.ORGANIZATION;
  }

  isVolunteer(): boolean {
    return this.roleFormGroup.get('role')?.value === UserRole.VOLUNTEER;
  }

  isFormInvalid(): boolean {
    if (this.accountFormGroup.invalid || this.roleFormGroup.invalid) {
      return true;
    }

    // Check role-specific validation
    if (this.isOrganization() && this.roleSpecificFormGroup.get('organizationName')?.invalid) {
      return true;
    }

    return false;
  }

  onSubmit(): void {
    if (this.isFormInvalid()) {
      return;
    }

    // Combine all form groups
    const formData = {
      ...this.accountFormGroup.value,
      ...this.roleFormGroup.value,
      ...this.roleSpecificFormGroup.value
    };

    // Add additional validation before submission
    if (formData.email && !this.isValidEmail(formData.email)) {
      this.store.dispatch(AuthActions.registerFailure({
        error: 'Please enter a valid email address'
      }));
      return;
    }

    if (formData.password && formData.password.length < 8) {
      this.store.dispatch(AuthActions.registerFailure({
        error: 'Password must be at least 8 characters long'
      }));
      return;
    }

    // Dispatch register action with all form data
    this.store.dispatch(AuthActions.register({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: formData.role,
      organizationName: formData.organizationName,
      organizationWebsite: formData.organizationWebsite,
      organizationDescription: formData.organizationDescription,
      phoneNumber: formData.phoneNumber,
      city: formData.city,
      country: formData.country
    }));

    // Subscribe to errors to provide more user-friendly messages
    this.error$.pipe(
      filter(error => !!error),
      take(1)
    ).subscribe(error => {
      if (error) {
        let userFriendlyError = error;

        // Transform backend errors into user-friendly messages
        if (error.includes('Email already exists')) {
          userFriendlyError = 'This email is already registered. Please use a different email or try logging in.';
        } else if (error.includes('validation')) {
          userFriendlyError = 'Please check your information and try again.';
        } else if (error.includes('server')) {
          userFriendlyError = 'Server error. Please try again later.';
        }

        // Update the error message
        this.store.dispatch(AuthActions.registerFailure({ error: userFriendlyError }));
      }
    });
  }

  // Helper method to validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}
