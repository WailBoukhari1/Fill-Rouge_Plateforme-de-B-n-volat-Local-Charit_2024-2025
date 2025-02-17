import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set New Password
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Please enter your new password
          </p>
        </div>

        <mat-card>
          <mat-card-content>
            <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
              <div>
                <mat-form-field class="w-full">
                  <mat-label>New Password</mat-label>
                  <input matInput [type]="hidePassword ? 'password' : 'text'" 
                         formControlName="newPassword" required>
                  <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                    <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                  </button>
                  <mat-error *ngIf="resetForm.get('newPassword')?.errors?.['required']">
                    Password is required
                  </mat-error>
                  <mat-error *ngIf="resetForm.get('newPassword')?.errors?.['minlength']">
                    Password must be at least 8 characters
                  </mat-error>
                </mat-form-field>

                <mat-form-field class="w-full mt-4">
                  <mat-label>Confirm Password</mat-label>
                  <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" 
                         formControlName="confirmPassword" required>
                  <button mat-icon-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword" type="button">
                    <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                  </button>
                  <mat-error *ngIf="resetForm.get('confirmPassword')?.errors?.['required']">
                    Please confirm your password
                  </mat-error>
                  <mat-error *ngIf="resetForm.get('confirmPassword')?.errors?.['passwordMismatch']">
                    Passwords do not match
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
                        [disabled]="resetForm.invalid || loading">
                  <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
                  <span *ngIf="!loading">Reset Password</span>
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  loading = false;
  error = '';
  hidePassword = true;
  hideConfirmPassword = true;
  code = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.code = this.route.snapshot.queryParams['code'];
    if (!this.code) {
      this.router.navigate(['/login']);
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.resetForm.valid && this.code) {
      this.loading = true;
      this.error = '';

      this.authService.resetPassword(this.code, this.resetForm.value.newPassword).subscribe({
        next: () => {
          this.router.navigate(['/login'], {
            queryParams: { passwordReset: true }
          });
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error.message;
        }
      });
    }
  }
} 