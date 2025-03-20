import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import { AuthService } from '../../../core/services/auth.service';
import { selectUser } from '../../../store/auth/auth.selectors';
import * as AuthActions from '../../../store/auth/auth.actions';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-extrabold text-gray-900 mb-2">
            Verify Your Email
          </h2>
          <p class="text-gray-600">
            Please enter the verification code sent to <span class="font-medium">{{ email }}</span>
          </p>
        </div>

        <mat-card class="shadow-lg rounded-lg overflow-hidden">
          <div class="bg-indigo-600 p-4 text-white text-center">
            <h3 class="text-xl font-medium">Email Verification</h3>
          </div>

          <mat-card-content class="p-6">
            <div class="text-center mb-6">
              <mat-icon class="text-5xl text-indigo-600">mark_email_read</mat-icon>
              <p class="mt-2 text-sm text-gray-600">
                We've sent a verification code to your email address.
                Please check your inbox and enter the code below.
              </p>
            </div>

            <form [formGroup]="verificationForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <div>
                <mat-form-field class="w-full">
                  <mat-label>Verification Code</mat-label>
                  <input matInput formControlName="code" required maxlength="6">
                  <mat-icon matPrefix class="mr-2 text-gray-500">vpn_key</mat-icon>
                  <mat-error *ngIf="verificationForm.get('code')?.errors?.['required']">
                    Verification code is required
                  </mat-error>
                </mat-form-field>
              </div>

              <div *ngIf="error" class="text-red-500 text-sm text-center bg-red-50 p-4 rounded border border-red-200">
                <div class="flex items-center justify-center">
                  <mat-icon class="text-red-500 mr-2">error_outline</mat-icon>
                  <span>{{ error }}</span>
                </div>
              </div>

              <div *ngIf="successMessage" class="text-green-500 text-sm text-center bg-green-50 p-4 rounded border border-green-200">
                <div class="flex items-center justify-center">
                  <mat-icon class="text-green-500 mr-2">check_circle</mat-icon>
                  <span>{{ successMessage }}</span>
                </div>
              </div>

              <div>
                <button mat-raised-button color="primary"
                        class="w-full py-2"
                        type="submit"
                        [disabled]="verificationForm.invalid || loading">
                  <div class="flex items-center justify-center">
                    <mat-spinner diameter="20" *ngIf="loading" class="mr-2"></mat-spinner>
                    <span>Verify Email</span>
                  </div>
                </button>
              </div>
            </form>
          </mat-card-content>

          <mat-divider></mat-divider>

          <div class="p-4 text-center bg-gray-50">
            <p class="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            <button mat-stroked-button color="primary"
                    [disabled]="loading || resendCooldown > 0"
                    (click)="resendCode()">
              <div class="flex items-center">
                <mat-icon class="mr-1">refresh</mat-icon>
                <span>Resend Code {{ resendCooldown > 0 ? '(' + resendCooldown + 's)' : '' }}</span>
              </div>
            </button>
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
export class VerifyEmailComponent implements OnInit {
  verificationForm: FormGroup;
  loading = false;
  error = '';
  successMessage = '';
  email = '';
  resendCooldown = 0;
  private cooldownInterval: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store
  ) {
    this.verificationForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit(): void {
    // Get email from query params
    this.email = this.route.snapshot.queryParams['email'];

    // If no email is provided, redirect to login
    if (!this.email) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Check if email is already verified
    this.checkEmailVerificationStatus();
  }

  private checkEmailVerificationStatus(): void {
    this.loading = true;

    this.authService.checkEmailVerificationStatus(this.email).subscribe({
      next: (response) => {
        this.loading = false;

        // If email is already verified, redirect to appropriate page
        if (response.data) {
          this.successMessage = 'Your email is already verified. Redirecting...';

          // Get current user from store
          this.store.select(selectUser).pipe(take(1)).subscribe(user => {
            if (user) {
              // Update user in store with verified email
              this.store.dispatch(AuthActions.loadStoredUserSuccess({
                user: { ...user, emailVerified: true }
              }));

              // Navigate after a short delay
              setTimeout(() => {
                // Check if questionnaire is completed
                if (!user.questionnaireCompleted) {
                  this.router.navigate(['/auth/questionnaire']);
                } else {
                  // Navigate based on role
                  switch (user.role) {
                    case 'ADMIN':
                      this.router.navigate(['/dashboard']);
                      break;
                    case 'VOLUNTEER':
                      this.router.navigate(['/dashboard/volunteer/profile']);
                      break;
                    case 'ORGANIZATION':
                      this.router.navigate(['/dashboard']);
                      break;
                    default:
                      this.router.navigate(['/dashboard']);
                  }
                }
              }, 2000);
            } else {
              this.router.navigate(['/auth/login']);
            }
          });
        }
      },
      error: (error) => {
        this.loading = false;
        // Silently fail - we'll just show the verification form
        console.error('Error checking email verification status:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.verificationForm.valid && this.email) {
      this.loading = true;
      this.error = '';
      this.successMessage = '';

      this.authService.verifyEmail(this.email, this.verificationForm.value.code).subscribe({
        next: () => {
          // Get current user from store
          this.store.select(selectUser).pipe(take(1)).subscribe(user => {
            if (user) {
              // Update user in store with verified email
              this.store.dispatch(AuthActions.loadStoredUserSuccess({
                user: { ...user, emailVerified: true }
              }));

              // Show success message
              this.successMessage = 'Email verified successfully! Redirecting...';

              // Stop loading
              this.loading = false;

              // Navigate to dashboard after a short delay
              setTimeout(() => {
                // Check if questionnaire is completed
                if (!user.questionnaireCompleted) {
                  this.router.navigate(['/auth/questionnaire']);
                } else {
                  // Navigate based on role
                  switch (user.role) {
                    case 'ADMIN':
                      this.router.navigate(['/dashboard']);
                      break;
                    case 'VOLUNTEER':
                      this.router.navigate(['/dashboard/volunteer/profile']);
                      break;
                    case 'ORGANIZATION':
                      this.router.navigate(['/dashboard']);
                      break;
                    default:
                      this.router.navigate(['/dashboard']);
                  }
                }
              }, 2000);
            } else {
              this.loading = false;
              this.router.navigate(['/auth/login']);
            }
          });
        },
        error: (error) => {
          this.loading = false;

          // Extract error message
          if (error.error && error.error.message) {
            this.error = error.error.message;
          } else if (error.message) {
            this.error = error.message;
          } else {
            this.error = 'Failed to verify email. Please try again.';
          }

          // Clear form
          this.verificationForm.reset();
        }
      });
    }
  }

  resendCode(): void {
    if (this.email && !this.loading && this.resendCooldown === 0) {
      this.loading = true;
      this.error = '';
      this.successMessage = '';

      this.authService.resendVerificationCode(this.email).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Verification code has been resent to your email';

          // Start cooldown
          this.startResendCooldown();
        },
        error: (error) => {
          this.loading = false;

          // Extract error message
          if (error.error && error.error.message) {
            this.error = error.error.message;
          } else if (error.message) {
            this.error = error.message;
          } else {
            this.error = 'Failed to resend verification code. Please try again.';
          }
        }
      });
    }
  }

  private startResendCooldown(): void {
    // Set cooldown to 60 seconds
    this.resendCooldown = 60;

    // Clear any existing interval
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }

    // Start countdown
    this.cooldownInterval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.cooldownInterval);
        this.resendCooldown = 0;
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    // Clear interval when component is destroyed
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }
}
