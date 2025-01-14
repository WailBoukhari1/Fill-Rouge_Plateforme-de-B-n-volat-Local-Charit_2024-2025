import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Reset Password</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()">
          <mat-form-field>
            <input matInput placeholder="New Password" formControlName="password" type="password">
          </mat-form-field>
          <mat-form-field>
            <input matInput placeholder="Confirm Password" formControlName="confirmPassword" type="password">
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit" [disabled]="!resetPasswordForm.valid">
            Update Password
          </button>
        </form>
      </mat-card-content>
    </mat-card>
  `
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.resetPasswordForm.valid) {
      console.log(this.resetPasswordForm.value);
    }
  }
} 