import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ]
})
export class VerifyEmailComponent implements OnInit {
  verificationForm: FormGroup;
  loading = false;
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.verificationForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit() {
    // Get email from registration flow
    const userEmail = localStorage.getItem('pendingVerificationEmail');
    if (userEmail) {
      this.email = userEmail;
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  onSubmit() {
    if (this.verificationForm.valid) {
      this.loading = true;
      const code = this.verificationForm.get('code')?.value;

      this.authService.verifyEmail(code).subscribe({
        next: (response) => {
          this.snackBar.open('Email verified successfully!', 'Close', { duration: 3000 });
          localStorage.removeItem('pendingVerificationEmail');
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.snackBar.open(error.error.message || 'Verification failed', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  resendCode() {
    if (this.email) {
      this.loading = true;
      this.authService.resendVerificationCode(this.email).subscribe({
        next: () => {
          this.snackBar.open('Verification code resent!', 'Close', { duration: 3000 });
          this.loading = false;
        },
        error: (error) => {
          this.snackBar.open(error.error.message || 'Failed to resend code', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }
} 