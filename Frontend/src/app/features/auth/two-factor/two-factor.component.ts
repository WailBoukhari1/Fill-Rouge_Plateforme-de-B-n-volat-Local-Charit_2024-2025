import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from '../../../core/services/auth.service';
import * as AuthActions from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-two-factor',
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
            Two-Factor Authentication
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            {{ isSetup ? 'Scan the QR code with your authenticator app' : 'Enter the verification code' }}
          </p>
        </div>

        <mat-card>
          <mat-card-content>
            <div *ngIf="isSetup" class="text-center mb-6">
              <img [src]="qrCodeUrl" alt="QR Code" class="mx-auto mb-4" *ngIf="qrCodeUrl">
              <p class="text-sm text-gray-600 mb-2">Secret Key:</p>
              <code class="bg-gray-100 px-2 py-1 rounded">{{ secretKey }}</code>
            </div>

            <form [formGroup]="twoFactorForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
              <div>
                <mat-form-field class="w-full">
                  <mat-label>Verification Code</mat-label>
                  <input matInput formControlName="code" required maxlength="6">
                  <mat-error *ngIf="twoFactorForm.get('code')?.errors?.['required']">
                    Verification code is required
                  </mat-error>
                  <mat-error *ngIf="twoFactorForm.get('code')?.errors?.['pattern']">
                    Code must be 6 digits
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
                        [disabled]="twoFactorForm.invalid || loading">
                  <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
                  <span *ngIf="!loading">
                    {{ isSetup ? 'Enable Two-Factor Auth' : 'Verify Code' }}
                  </span>
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `
})
export class TwoFactorComponent implements OnInit {
  twoFactorForm: FormGroup;
  loading = false;
  error = '';
  isSetup = false;
  qrCodeUrl?: SafeUrl;
  secretKey = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private store: Store
  ) {
    this.twoFactorForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  ngOnInit(): void {
    // Check if we're setting up 2FA or verifying a code
    this.isSetup = this.router.url.includes('setup');
    
    if (this.isSetup) {
      this.setupTwoFactor();
    }
  }

  private setupTwoFactor(): void {
    this.loading = true;
    this.error = '';

    this.authService.setupTwoFactor().subscribe({
      next: (response) => {
        this.loading = false;
        this.secretKey = response.data.secretKey;
        this.qrCodeUrl = this.sanitizer.bypassSecurityTrustUrl(response.data.qrCodeUrl);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error.message;
      }
    });
  }

  onSubmit(): void {
    if (this.twoFactorForm.valid) {
      this.loading = true;
      this.error = '';

      const code = this.twoFactorForm.value.code;

      if (this.isSetup) {
        this.authService.enableTwoFactor({ code }).subscribe({
          next: () => {
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            this.loading = false;
            this.error = error.error.message;
          }
        });
      } else {
        // Verify code for login
        const pendingLogin = JSON.parse(sessionStorage.getItem('pendingLogin') || '{}');
        this.store.dispatch(AuthActions.login({
          email: pendingLogin.email,
          password: pendingLogin.password,
          twoFactorCode: code
        }));
      }
    }
  }
} 