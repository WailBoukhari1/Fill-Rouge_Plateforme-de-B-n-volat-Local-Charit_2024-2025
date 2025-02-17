import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you instructions to reset your password
          </p>
        </div>

        <mat-card>
          <mat-card-content>
            <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
              <div>
                <mat-form-field class="w-full">
                  <mat-label>Email address</mat-label>
                  <input matInput formControlName="email" type="email" required>
                  <mat-error *ngIf="resetForm.get('email')?.errors?.['required']">
                    Email is required
                  </mat-error>
                  <mat-error *ngIf="resetForm.get('email')?.errors?.['email']">
                    Please enter a valid email
                  </mat-error>
                </mat-form-field>
              </div>

              <div *ngIf="error" class="text-red-500 text-sm text-center">
                {{ error }}
              </div>

              <div *ngIf="success" class="text-green-500 text-sm text-center">
                {{ success }}
              </div>

              <div>
                <button mat-raised-button color="primary"
                        class="w-full"
                        type="submit"
                        [disabled]="resetForm.invalid || loading">
                  <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
                  <span *ngIf="!loading">Send Reset Instructions</span>
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <div class="text-center">
          <a routerLink="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
            Back to login
          </a>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  resetForm: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.resetForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      this.authService.forgotPassword(this.resetForm.value.email).subscribe({
        next: () => {
          this.loading = false;
          this.success = 'Password reset instructions have been sent to your email';
          this.resetForm.reset();
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error.message;
        }
      });
    }
  }
} 