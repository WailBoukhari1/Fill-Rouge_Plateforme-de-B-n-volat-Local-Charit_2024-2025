import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { UserRole } from '../../../../core/models/auth.models';
import { AuthService } from '../../../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    RouterModule,
    MatIconModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex items-center mb-6">
        <button mat-button class="mr-2" routerLink="/admin/users">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="text-2xl font-bold">Add New User</h1>
      </div>

      <mat-card class="max-w-2xl mx-auto">
        <mat-card-content>
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- First Name -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" required>
                <mat-error *ngIf="userForm.get('firstName')?.hasError('required')">
                  First name is required
                </mat-error>
              </mat-form-field>
              
              <!-- Last Name -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" required>
                <mat-error *ngIf="userForm.get('lastName')?.hasError('required')">
                  Last name is required
                </mat-error>
              </mat-form-field>
              
              <!-- Email -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" required type="email">
                <mat-error *ngIf="userForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="userForm.get('email')?.hasError('email')">
                  Please enter a valid email address
                </mat-error>
              </mat-form-field>
              
              <!-- Phone Number -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Phone Number</mat-label>
                <input matInput formControlName="phoneNumber">
              </mat-form-field>
              
              <!-- Password -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Password</mat-label>
                <input matInput formControlName="password" required type="password">
                <mat-error *ngIf="userForm.get('password')?.hasError('required')">
                  Password is required
                </mat-error>
                <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">
                  Password must be at least 8 characters
                </mat-error>
              </mat-form-field>
              
              <!-- Confirm Password -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Confirm Password</mat-label>
                <input matInput formControlName="confirmPassword" required type="password">
                <mat-error *ngIf="userForm.get('confirmPassword')?.hasError('required')">
                  Confirm password is required
                </mat-error>
                <mat-error *ngIf="userForm.get('confirmPassword')?.hasError('passwordMismatch')">
                  Passwords do not match
                </mat-error>
              </mat-form-field>
              
              <!-- Role -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Role</mat-label>
                <mat-select formControlName="role" required>
                  <mat-option *ngFor="let role of availableRoles" [value]="role">
                    {{ role }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="userForm.get('role')?.hasError('required')">
                  Role is required
                </mat-error>
              </mat-form-field>
            </div>
            
            <div class="flex justify-between mt-6">
              <button mat-button type="button" routerLink="/admin/users">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="userForm.invalid || isSubmitting">
                {{ isSubmitting ? 'Creating...' : 'Create User' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class UserAddComponent implements OnInit {
  userForm: FormGroup;
  isSubmitting = false;
  availableRoles = Object.values(UserRole);
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      role: [UserRole.VOLUNTEER, Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    
    const formValue = this.userForm.value;
    const registerRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phoneNumber: formValue.phoneNumber,
      password: formValue.password,
      confirmPassword: formValue.confirmPassword,
      role: formValue.role
    };
    
    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/admin/users']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.snackBar.open(`Error creating user: ${error.message || 'Unknown error'}`, 'Close', { duration: 5000 });
      }
    });
  }
} 