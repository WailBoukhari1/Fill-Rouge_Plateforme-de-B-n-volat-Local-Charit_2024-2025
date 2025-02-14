import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import { AuthService } from '../../../../core/services/auth.service';
import * as AuthActions from '../../../../store/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../../../store/auth/auth.selectors';
import { RouterLink } from '@angular/router';
import { AuthState } from '../../../../core/models/auth.model';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styles: [`
    :host {
      display: block;
    }
    
    .mat-mdc-form-field {
      width: 100%;
    }

    .mat-mdc-raised-button {
      height: 48px;
    }

    :host ::ng-deep {
      .mat-mdc-form-field-outline {
        @apply transition-colors duration-200;
      }

      .mat-mdc-form-field:hover .mat-mdc-form-field-outline {
        @apply opacity-80;
      }

      .mat-mdc-form-field-subscript-wrapper {
        @apply transition-all duration-200;
      }

      .mat-mdc-form-field-flex {
        background-color: rgba(255, 255, 255, 0.6);
        backdrop-filter: blur(5px);
      }
    }
  `]
})
export class RegisterComponent implements OnDestroy {
  registerForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);
  private destroy$ = new Subject<void>();

  roles = [
    { value: 'VOLUNTEER', label: 'Volunteer' },
    { value: 'ORGANIZATION', label: 'Organization' }
  ];

  constructor(
    private fb: FormBuilder,
    private store: Store<{ auth: AuthState }>,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      firstName: ['', {
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s'-]+$/) // Only letters, spaces, hyphens and apostrophes
        ],
        updateOn: 'change'
      }],
      lastName: ['', {
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s'-]+$/) // Only letters, spaces, hyphens and apostrophes
        ],
        updateOn: 'change'
      }],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,}$/)
      ]],
      confirmPassword: ['', Validators.required],
      role: ['VOLUNTEER', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });

    // Log form status changes
    this.registerForm.statusChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(status => {
      console.log('Form Status:', status);
      console.log('Form Valid:', this.registerForm.valid);
      console.log('Form Errors:', this.registerForm.errors);
      
      // Log individual field statuses
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control?.invalid) {
          console.log(`${key} errors:`, control.errors);
        }
      });
    });
  }

  private passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  getPasswordErrorMessage(): string {
    const control = this.registerForm.get('password');
    if (control?.hasError('required')) {
      return 'Password is required';
    }
    if (control?.hasError('pattern')) {
      return 'Password must be at least 8 characters long and contain at least one digit, one uppercase, one lowercase letter, and one special character';
    }
    return '';
  }

  isFormValid(): boolean {
    if (!this.registerForm.valid) return false;
    
    const firstName = this.registerForm.get('firstName')?.value?.trim() || '';
    const lastName = this.registerForm.get('lastName')?.value?.trim() || '';
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    
    return firstName.length >= 2 && 
           lastName.length >= 2 && 
           password === confirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      const credentials = {
        firstName: formValue.firstName?.trim(),
        lastName: formValue.lastName?.trim(),
        email: formValue.email?.trim(),
        password: formValue.password,
        role: formValue.role
      };

      this.store.dispatch(AuthActions.register({ credentials }));

      // Subscribe to error state to handle specific error cases
      this.error$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(error => {
        if (error?.includes('User is disabled')) {
          this.router.navigate(['/auth/verify-email'], { 
            queryParams: { 
              email: credentials.email,
              isDisabled: true 
            }
          });
        }
      });
    }
  }

  resendVerificationEmail(email: string): void {
    this.authService.resendVerificationEmail(email).subscribe({
      next: () => {
        // Show success message
        this.snackBar.open('Verification email sent successfully', 'Close', {
          duration: 5000
        });
      },
      error: (err) => {
        // Show error message
        this.snackBar.open(err.error?.message || 'Failed to send verification email', 'Close', {
          duration: 5000
        });
      }
    });
  }

  loginWithGoogle(): void {
    this.store.dispatch(AuthActions.oAuthLogin({ 
      provider: 'google',
      code: ''
    }));
  }

  navigateToLogin(): void {
    this.authService.navigateToLogin();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
} 