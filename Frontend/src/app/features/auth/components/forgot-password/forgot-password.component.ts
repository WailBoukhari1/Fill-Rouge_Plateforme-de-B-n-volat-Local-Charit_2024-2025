import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { RouterLink } from '@angular/router';
import * as AuthActions from '../../../../store/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../../../store/auth/auth.selectors';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthState } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './forgot-password.component.html',
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
    .mat-icon {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
  `]
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);

  constructor(
    private fb: FormBuilder,
    private store: Store<{ auth: AuthState }>,
    private authService: AuthService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.store.dispatch(AuthActions.forgotPassword({ email: this.forgotPasswordForm.value.email }));
    }
  }

  navigateToLogin(): void {
    this.authService.navigateToLogin();
  }
} 