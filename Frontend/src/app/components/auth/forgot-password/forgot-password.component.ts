import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Forgot Password</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
          <mat-form-field>
            <input matInput placeholder="Email" formControlName="email" type="email">
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit" [disabled]="!forgotPasswordForm.valid">
            Reset Password
          </button>
        </form>
      </mat-card-content>
    </mat-card>
  `
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      console.log(this.forgotPasswordForm.value);
    }
  }
} 