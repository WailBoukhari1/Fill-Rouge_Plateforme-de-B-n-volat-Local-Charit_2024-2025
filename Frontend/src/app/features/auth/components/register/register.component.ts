import { Component } from '@angular/core';
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
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);

  constructor(
    private fb: FormBuilder,
    private store: Store<{ auth: AuthState }>,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const credentials = this.registerForm.value;
      this.store.dispatch(AuthActions.register({ credentials }));
    }
  }

  loginWithGoogle(): void {
    this.store.dispatch(AuthActions.oAuthLogin({ 
      provider: 'google',
      code: '' // This should be obtained from OAuth response
    }));
  }

  navigateToLogin(): void {
    this.authService.navigateToLogin();
  }
} 