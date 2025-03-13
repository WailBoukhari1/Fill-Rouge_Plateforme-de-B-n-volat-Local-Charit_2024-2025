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
import { RegisterRequest } from '../../../core/models/auth.models';

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
                    <mat-label>Phone Number</mat-label>
                    <input matInput formControlName="phoneNumber" required placeholder="Example: 0612345678">
                    <mat-icon matPrefix class="mr-2 text-gray-500">phone</mat-icon>
                    <mat-error *ngIf="accountFormGroup.get('phoneNumber')?.hasError('required')">
                      Phone number is required
                    </mat-error>
                    <mat-error *ngIf="accountFormGroup.get('phoneNumber')?.hasError('pattern')">
                      Please enter a valid Moroccan phone number (e.g., 0612345678 or +212612345678)
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
                      <mat-label>Organization Type</mat-label>
                      <mat-select formControlName="organizationType" required>
                        <mat-option value="NGO">Non-Governmental Organization (NGO)</mat-option>
                        <mat-option value="NONPROFIT">Non-Profit Organization</mat-option>
                        <mat-option value="CHARITY">Charitable Organization</mat-option>
                        <mat-option value="FOUNDATION">Foundation</mat-option>
                        <mat-option value="SOCIAL_ENTERPRISE">Social Enterprise</mat-option>
                        <mat-option value="COMMUNITY_GROUP">Community Group</mat-option>
                      </mat-select>
                      <mat-icon matPrefix class="mr-2 text-gray-500">category</mat-icon>
                      <mat-error *ngIf="roleSpecificFormGroup.get('organizationType')?.errors?.['required']">
                        Organization type is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Organization Website</mat-label>
                      <input matInput formControlName="organizationWebsite">
                      <mat-icon matPrefix class="mr-2 text-gray-500">language</mat-icon>
                      <mat-error *ngIf="roleSpecificFormGroup.get('organizationWebsite')?.errors?.['pattern']">
                        Please enter a valid website URL
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Mission Statement</mat-label>
                      <textarea matInput formControlName="missionStatement" rows="2" required></textarea>
                      <mat-icon matPrefix class="mr-2 text-gray-500">assignment</mat-icon>
                      <mat-error *ngIf="roleSpecificFormGroup.get('missionStatement')?.errors?.['required']">
                        Mission statement is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Organization Description</mat-label>
                      <textarea matInput formControlName="organizationDescription" rows="3" required></textarea>
                      <mat-icon matPrefix class="mr-2 text-gray-500">description</mat-icon>
                      <mat-error *ngIf="roleSpecificFormGroup.get('organizationDescription')?.errors?.['required']">
                        Organization description is required
                      </mat-error>
                      <mat-error *ngIf="roleSpecificFormGroup.get('organizationDescription')?.errors?.['maxlength']">
                        Description cannot exceed 500 characters
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <!-- Message for volunteers -->
                  <div *ngIf="isVolunteer()" class="space-y-6">
                    <div class="text-center">
                      <h3 class="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h3>
                      <p class="text-gray-600 mb-6">
                        Join our community of passionate volunteers making a difference
                      </p>
                    </div>

                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Profile Preview -->
                        <div class="space-y-4">
                          <h4 class="text-lg font-semibold text-gray-900">Your Profile Preview</h4>
                          <div class="bg-gray-50 rounded p-4 space-y-3">
                            <div class="flex items-center space-x-3">
                              <mat-icon class="text-indigo-600">account_circle</mat-icon>
                              <div>
                                <p class="font-medium">{{accountFormGroup.get('firstName')?.value}} {{accountFormGroup.get('lastName')?.value}}</p>
                                <p class="text-sm text-gray-600">{{accountFormGroup.get('email')?.value}}</p>
                              </div>
                            </div>
                            <div class="flex items-center space-x-3">
                              <mat-icon class="text-indigo-600">phone</mat-icon>
                              <p class="text-gray-600">{{accountFormGroup.get('phoneNumber')?.value}}</p>
                            </div>
                          </div>
                        </div>

                        <!-- Next Steps -->
                        <div class="space-y-4">
                          <h4 class="text-lg font-semibold text-gray-900">Next Steps</h4>
                          <div class="space-y-3">
                            <div class="flex items-start space-x-3">
                              <div class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span class="text-sm font-medium text-indigo-600">1</span>
                              </div>
                              <div>
                                <p class="font-medium text-gray-900">Complete Your Profile</p>
                                <p class="text-sm text-gray-600">Add your skills, interests, and availability</p>
                              </div>
                            </div>
                            <div class="flex items-start space-x-3">
                              <div class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span class="text-sm font-medium text-indigo-600">2</span>
                              </div>
                              <div>
                                <p class="font-medium text-gray-900">Set Your Preferences</p>
                                <p class="text-sm text-gray-600">Choose causes and organizations you'd like to support</p>
                              </div>
                            </div>
                            <div class="flex items-start space-x-3">
                              <div class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span class="text-sm font-medium text-indigo-600">3</span>
                              </div>
                              <div>
                                <p class="font-medium text-gray-900">Start Volunteering</p>
                                <p class="text-sm text-gray-600">Browse and apply for volunteer opportunities</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Benefits -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div class="flex items-center space-x-3 mb-3">
                          <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <mat-icon class="text-green-600">handshake</mat-icon>
                          </div>
                          <h5 class="font-semibold text-gray-900">Personalized Matches</h5>
                        </div>
                        <p class="text-gray-600 text-sm">Get matched with opportunities that align with your skills and interests</p>
                      </div>

                      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div class="flex items-center space-x-3 mb-3">
                          <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <mat-icon class="text-blue-600">schedule</mat-icon>
                          </div>
                          <h5 class="font-semibold text-gray-900">Flexible Schedule</h5>
                        </div>
                        <p class="text-gray-600 text-sm">Choose opportunities that fit your availability and preferences</p>
                      </div>

                      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div class="flex items-center space-x-3 mb-3">
                          <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <mat-icon class="text-purple-600">diversity_3</mat-icon>
                          </div>
                          <h5 class="font-semibold text-gray-900">Community Impact</h5>
                        </div>
                        <p class="text-gray-600 text-sm">Make a real difference in your community while building valuable experience</p>
                      </div>
                    </div>

                    <div class="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
                      <div class="flex items-start space-x-4">
                        <div class="flex-shrink-0">
                          <mat-icon class="text-indigo-600">info</mat-icon>
                        </div>
                        <div>
                          <h5 class="font-medium text-indigo-900 mb-1">Ready to make a difference?</h5>
                          <p class="text-indigo-700 text-sm">
                            After registration, you'll be guided through a quick questionnaire to help us understand your interests and preferences better. This helps us match you with the perfect volunteering opportunities in your area.
                          </p>
                        </div>
                      </div>
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
    this.initializeForm();
  }

  ngOnInit(): void {
    // Clear any existing auth errors when component initializes
    this.store.dispatch(AuthActions.loginFailure({ error: '' }));
  }

  initializeForm(): void {
    this.accountFormGroup = this.fb.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZÀ-ÿ\s\-']+$/)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZÀ-ÿ\s\-']+$/)
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
      ]],
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern(/^(\+212|0)[5-7][0-9]{8}$/)
      ]]
    });

    this.roleFormGroup = this.fb.group({
      role: ['', Validators.required]
    });

    this.roleSpecificFormGroup = this.fb.group({
      organizationName: [''],
      organizationWebsite: ['', Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)],
      organizationDescription: ['', [Validators.maxLength(500)]],
      organizationType: [''],
      missionStatement: ['']
    });
  }

  onRoleChange(): void {
    const role = this.roleFormGroup.get('role')?.value;
    
    if (role === UserRole.ORGANIZATION) {
      this.roleSpecificFormGroup.get('organizationName')?.setValidators([Validators.required]);
      this.roleSpecificFormGroup.get('organizationDescription')?.setValidators([Validators.required]);
      this.roleSpecificFormGroup.get('organizationType')?.setValidators([Validators.required]);
      this.roleSpecificFormGroup.get('missionStatement')?.setValidators([Validators.required]);
    } else {
      this.roleSpecificFormGroup.get('organizationName')?.clearValidators();
      this.roleSpecificFormGroup.get('organizationDescription')?.clearValidators();
      this.roleSpecificFormGroup.get('organizationType')?.clearValidators();
      this.roleSpecificFormGroup.get('missionStatement')?.clearValidators();
    }
    
    this.roleSpecificFormGroup.updateValueAndValidity();
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
    if (this.isOrganization()) {
      const orgName = this.roleSpecificFormGroup.get('organizationName');
      const orgDesc = this.roleSpecificFormGroup.get('organizationDescription');
      const orgType = this.roleSpecificFormGroup.get('organizationType');
      const mission = this.roleSpecificFormGroup.get('missionStatement');

      return !orgName?.valid || !orgDesc?.valid || !orgType?.valid || !mission?.valid;
    }

    return false;
  }

  onSubmit(): void {
    if (this.isFormInvalid()) {
      return;
    }

    const formData = {
      ...this.accountFormGroup.value,
      ...this.roleFormGroup.value,
      ...this.roleSpecificFormGroup.value
    };

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

    // Create the register request object with only the properties defined in RegisterRequest interface
    const registerRequest: RegisterRequest = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      role: formData.role,
      ...(this.isOrganization() && {
        organizationName: formData.organizationName,
        organizationWebsite: formData.organizationWebsite,
        organizationDescription: formData.organizationDescription,
        organizationType: formData.organizationType,
        missionStatement: formData.missionStatement
      })
    };

    // Dispatch register action with the properly typed request
    this.store.dispatch(AuthActions.register(registerRequest));

    // Subscribe to errors to provide more user-friendly messages
    this.error$.pipe(
      filter(error => !!error),
      take(1)
    ).subscribe(error => {
      if (error) {
        let userFriendlyError = error;

        if (error.includes('Email already exists')) {
          userFriendlyError = 'This email is already registered. Please use a different email or try logging in.';
        } else if (error.includes('validation')) {
          userFriendlyError = 'Please check your information and try again.';
        } else if (error.includes('server')) {
          userFriendlyError = 'Server error. Please try again later.';
        }

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
