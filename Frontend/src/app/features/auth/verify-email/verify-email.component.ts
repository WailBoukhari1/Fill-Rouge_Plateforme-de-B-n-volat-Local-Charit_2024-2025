import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Please enter the verification code sent to {{ email }}
          </p>
        </div>

        <mat-card>
          <mat-card-content>
            <form [formGroup]="verificationForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
              <div>
                <mat-form-field class="w-full">
                  <mat-label>Verification Code</mat-label>
                  <input matInput formControlName="code" required>
                  <mat-error *ngIf="verificationForm.get('code')?.errors?.['required']">
                    Verification code is required
                  </mat-error>
                </mat-form-field>
              </div>

              <div *ngIf="error" class="text-red-500 text-sm text-center">
                {{ error }}
              </div>

              <div>
                <button mat-raised-button color="primary"
                        class="w-full"
                        type="submit"
                        [disabled]="verificationForm.invalid || loading">
                  <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
                  <span *ngIf="!loading">Verify Email</span>
                </button>
              </div>

              <div class="text-center mt-4">
                <button mat-button type="button" 
                        [disabled]="loading"
                        (click)="resendCode()">
                  Resend verification code
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `
})
export class VerifyEmailComponent implements OnInit {
  verificationForm: FormGroup;
  loading = false;
  error = '';
  email = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store
  ) {
    this.verificationForm = this.fb.group({
      code: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParams['email'];
    if (!this.email) {
      this.router.navigate(['/auth/login']);
    }
  }

  onSubmit(): void {
    if (this.verificationForm.valid && this.email) {
      this.loading = true;
      this.error = '';

      this.authService.verifyEmail(this.email, this.verificationForm.value.code).subscribe({
        next: () => {
          // Get current user from store
          this.store.select(selectUser).pipe(take(1)).subscribe(user => {
            if (user) {
              // Update user in store with verified email
              this.store.dispatch(AuthActions.loadStoredUserSuccess({
                user: { ...user, emailVerified: true }
              }));

              // Stop loading
              this.loading = false;

              // Navigate to dashboard (simplified route)
              this.router.navigate(['/dashboard']);
            } else {
              this.loading = false;
              this.router.navigate(['/auth/login']);
            }
          });
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error.message;
        }
      });
    }
  }

  resendCode(): void {
    if (this.email && !this.loading) {
      this.loading = true;
      this.error = '';

      this.authService.resendVerificationCode(this.email).subscribe({
        next: () => {
          this.loading = false;
          this.error = 'Verification code has been resent to your email';
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error.message;
        }
      });
    }
  }
} 