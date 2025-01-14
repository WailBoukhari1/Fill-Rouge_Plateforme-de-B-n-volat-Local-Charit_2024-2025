import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCheckboxModule,
    FontAwesomeModule
  ],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  faUser = faUser;
  faEnvelope = faEnvelope;
  faLock = faLock;
  registerForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      acceptTerms: [false, [Validators.requiredTrue]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;
      
      const registrationData = {
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`
      };

      this.isLoading = true;
      this.authService.register(registrationData)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.router.navigate(['/auth/verify-email']);
            } else {
              this.snackBar.open(response.message || 'Registration failed', 'Close', { duration: 3000 });
            }
          },
          error: (error) => {
            this.snackBar.open(error.error?.message || 'Registration failed', 'Close', { duration: 3000 });
            this.isLoading = false;
          },
          complete: () => {
            this.isLoading = false;
          }
        });
    }
  }
} 