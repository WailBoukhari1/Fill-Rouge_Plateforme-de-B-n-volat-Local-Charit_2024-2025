import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectUserRole } from '../../../store/auth/auth.selectors';
import { take, catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
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

          const path = role.toLowerCase();
          if (this.router.url === '/dashboard/profile') {
            this.router.navigate(['/dashboard/profile', path]);
          }
        },
        error: (error) => {
          console.error('Error getting user role:', error);
          this.snackBar.open(
            'Error loading profile. Please try again.',
            'Close',
            {
              duration: 3000,
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
            }
          );
        },
      });
  }
}
