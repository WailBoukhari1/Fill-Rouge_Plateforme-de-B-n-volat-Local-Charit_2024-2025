import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthActions } from '../../../../store/auth/auth.actions';
import { selectAuthError, selectAuthLoading, selectUser } from '../../../../store/auth/auth.selectors';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './verify-email.component.html',
  styles: [`
    :host {
      display: block;
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
export class VerifyEmailComponent implements OnInit {
  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);
  verifyForm: FormGroup;
  userEmail$ = this.store.select(selectUser).pipe(
    map(user => {
      console.log('User from store:', user);
      return user?.email;
    })
  );

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.verifyForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit(): void {
    // Debug: Log the current user email when component initializes
    this.userEmail$.pipe(take(1)).subscribe(email => {
      console.log('Current user email:', email);
    });
  }

  verifyEmail(): void {
    if (this.verifyForm.valid) {
      this.userEmail$.pipe(take(1)).subscribe(email => {
        if (email) {
          console.log('Verifying email with code:', this.verifyForm.value.code);
          this.store.dispatch(AuthActions.verifyEmail({ 
            email: email,
            code: this.verifyForm.value.code 
          }));
        } else {
          console.error('No email found in store');
        }
      });
    }
  }

  resendVerificationEmail(): void {
    console.log('Resend verification email clicked');
    
    this.userEmail$.pipe(take(1)).subscribe(email => {
      if (email) {
        console.log('Found email in store:', email);
        this.store.dispatch(AuthActions.resendVerificationEmail({ email }));
      } else {
        console.error('No email found in store');
      }
    });
  }

  navigateToLogin(): void {
    this.authService.navigateToLogin();
  }
} 