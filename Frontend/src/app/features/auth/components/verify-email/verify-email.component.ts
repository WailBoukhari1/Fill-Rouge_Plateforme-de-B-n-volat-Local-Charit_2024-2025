import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg text-center">
        <div>
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Email Verification Required</h2>
          <p class="mt-2 text-sm text-gray-600">
            Your account is currently inactive because your email address hasn't been verified.
          </p>
          <p class="mt-2 text-sm text-gray-600">
            Please enter the verification code sent to your email.
          </p>
        </div>

        <form [formGroup]="verifyForm" (ngSubmit)="verifyEmail()" class="mt-8 space-y-6">
          <div>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Verification Code</mat-label>
              <input matInput formControlName="code" placeholder="Enter 6-digit code">
              <mat-error *ngIf="verifyForm.get('code')?.errors?.['required']">
                Verification code is required
              </mat-error>
              <mat-error *ngIf="verifyForm.get('code')?.errors?.['minlength'] || verifyForm.get('code')?.errors?.['maxlength']">
                Code must be 6 digits
              </mat-error>
            </mat-form-field>
          </div>

          <div>
            <button 
              mat-raised-button 
              color="primary" 
              type="submit"
              class="w-full"
              [disabled]="loading || verifyForm.invalid">
              <ng-container *ngIf="!loading">
                Verify Email
              </ng-container>
              <mat-spinner diameter="24" *ngIf="loading"></mat-spinner>
            </button>
          </div>
        </form>

        <div class="mt-4">
          <button 
            mat-button
            color="primary"
            [disabled]="loading"
            (click)="resendVerificationEmail()">
            Resend Verification Code
          </button>
        </div>

        <div class="mt-4">
          <p class="text-sm text-gray-600">
            If you continue to experience issues, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  `
})
export class VerifyEmailComponent implements OnInit {
  email: string = '';
  loading: boolean = false;
  verifyForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.verifyForm = this.fb.group({
      code: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
        Validators.pattern(/^[0-9]{6}$/)
      ]]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      if (!this.email) {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  verifyEmail() {
    if (this.verifyForm.invalid) return;
    
    this.loading = true;
    const code = this.verifyForm.get('code')?.value;

    this.authService.verifyEmailWithCode(this.email, code).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Email verified successfully', 'Close', { duration: 5000 });
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(error, 'Close', { duration: 5000 });
      }
    });
  }

  resendVerificationEmail() {
    if (!this.email || this.loading) return;
    
    this.loading = true;
    this.authService.resendVerificationEmail(this.email).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Verification code sent successfully', 'Close', { duration: 5000 });
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(error, 'Close', { duration: 5000 });
      }
    });
  }
} 