import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectUserRole } from '../../../store/auth/auth.selectors';
import { take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserRole } from '../../../core/models/auth.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSnackBarModule
  ],
  template: `
    <router-outlet></router-outlet>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class ProfileComponent implements OnInit {
  constructor(
    private store: Store,
    private router: Router,
    private profileService: ProfileService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.store
      .select(selectUserRole)
      .pipe(take(1))
      .subscribe({
        next: (role) => {
          if (!role) {
            this.router.navigate(['/auth/login']);
            return;
          }

          // Redirect to the appropriate profile route based on user role
          switch (role) {
            case UserRole.VOLUNTEER:
              if (this.router.url === '/profile') {
                this.router.navigate(['/volunteer/profile']);
              }
              break;
            case UserRole.ORGANIZATION:
              if (this.router.url === '/profile') {
                this.router.navigate(['/profile/organization']);
              }
              break;
            case UserRole.ADMIN:
              this.router.navigate(['/users']);
              break;
            default:
              this.router.navigate(['/']);
          }
        },
        error: (error) => {
          console.error('Error getting user role:', error);
          this.snackBar.open(
            'Error loading profile. Please try again.',
            'Close',
            {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
            }
          );
        },
      });

    // Pre-fetch the profile data
    this.profileService
      .getCurrentUserProfile()
      .pipe(take(1))
      .subscribe({
        error: (error) => {
          console.error('Error fetching profile:', error);
          this.snackBar.open(
            'Error loading profile data. Please try again.',
            'Close',
            {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
            }
          );
        },
      });
  }
}
