import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import { AuthService } from '../../../../core/services/auth.service';
import * as AuthActions from '../../../../store/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../../../store/auth/auth.selectors';
import { RouterLink } from '@angular/router';
import { AuthState } from '../../../../core/models/auth.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
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
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private store: Store<{ auth: AuthState }>,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.store.dispatch(AuthActions.login({ credentials: this.loginForm.value }));
    }
  }

  loginWithGoogle(): void {
    const googleAuthUrl = `${environment.apiUrl.replace('/api', '')}/oauth2/authorization/google`;
    window.location.href = googleAuthUrl;
  }

  navigateToRegister(): void {
    this.authService.navigateToRegister();
  }

  navigateToForgotPassword(): void {
    this.authService.navigateToForgotPassword();
  }
} 