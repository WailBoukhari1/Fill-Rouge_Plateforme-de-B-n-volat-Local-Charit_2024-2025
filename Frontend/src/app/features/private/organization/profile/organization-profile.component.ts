import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {
  Organization,
  OrganizationStats,
} from '../../../../store/organization/organization.types';
import { ProfileService } from '../../../../core/services/profile.service';

function isOrganization(profile: any): profile is Organization {
  return (
    profile &&
    'type' in profile &&
    'missionStatement' in profile &&
    'focusAreas' in profile
  );
}

@Component({
  selector: 'app-organization-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './organization-profile.component.html',
  styleUrls: ['./organization-profile.component.scss'],
})
export class OrganizationProfileComponent implements OnInit {
  profileForm!: FormGroup;
  loading = false;
  error: string | null = null;
  profile: Organization | null = null;
  statistics: OrganizationStats | null = null;

  focusAreaOptions = [
    { value: 'EDUCATION', label: 'Education' },
    { value: 'HEALTH', label: 'Healthcare' },
    { value: 'ENVIRONMENT', label: 'Environment' },
    { value: 'SOCIAL_SERVICES', label: 'Social Services' },
    { value: 'ARTS_CULTURE', label: 'Arts & Culture' },
    { value: 'YOUTH_DEVELOPMENT', label: 'Youth Development' },
    { value: 'ANIMAL_WELFARE', label: 'Animal Welfare' },
    { value: 'COMMUNITY_DEVELOPMENT', label: 'Community Development' },
    { value: 'DISASTER_RELIEF', label: 'Disaster Relief' },
    { value: 'HUMAN_RIGHTS', label: 'Human Rights' },
  ];

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.loading = true;
    this.profileService.getCurrentUserProfile().subscribe({
      next: (profile) => {
        if (!isOrganization(profile)) {
          this.snackBar.open('Invalid profile type', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/dashboard']);
          return;
        }
        this.profile = profile;
        this.profileForm.patchValue(profile);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.error = 'Failed to load profile';
        this.loading = false;
        this.snackBar.open(
          'Error loading profile. Please try again.',
          'Close',
          {
            duration: 3000,
          }
        );
      },
    });

    this.profileService.getProfileStats().subscribe({
      next: (stats) => {
        this.statistics = stats as OrganizationStats;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.snackBar.open(
          'Error loading statistics. Please try again.',
          'Close',
          {
            duration: 3000,
          }
        );
      },
    });
  }

  private createForm() {
    this.profileForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      type: ['', Validators.required],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(2000),
        ],
      ],
      missionStatement: [
        '',
        [
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(1000),
        ],
      ],
      vision: ['', Validators.maxLength(1000)],
      website: ['', Validators.pattern('https?://.+')],
      registrationNumber: ['', Validators.pattern('^[A-Za-z0-9-/]+$')],
      taxId: ['', Validators.pattern('^[A-Za-z0-9-/]+$')],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern('^[0-9+()-]+$')],
      ],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      focusAreas: [[], Validators.required],
      foundedYear: [
        '',
        [Validators.min(1800), Validators.max(new Date().getFullYear())],
      ],
      socialMedia: this.fb.group({
        facebook: [
          '',
          Validators.pattern('https?://(www\\.)?facebook\\.com/.+'),
        ],
        twitter: ['', Validators.pattern('https?://(www\\.)?twitter\\.com/.+')],
        linkedin: [
          '',
          Validators.pattern('https?://(www\\.)?linkedin\\.com/.+'),
        ],
        instagram: [
          '',
          Validators.pattern('https?://(www\\.)?instagram\\.com/.+'),
        ],
      }),
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.loading = true;
      this.profileService
        .updateCurrentUserProfile(this.profileForm.value)
        .subscribe({
          next: (profile) => {
            if (!isOrganization(profile)) {
              this.snackBar.open('Invalid profile type returned', 'Close', {
                duration: 3000,
              });
              return;
            }
            this.profile = profile;
            this.loading = false;
            this.snackBar.open('Profile updated successfully', 'Close', {
              duration: 3000,
            });
          },
          error: (error) => {
            console.error('Error updating profile:', error);
            this.loading = false;
            this.snackBar.open(
              'Error updating profile. Please try again.',
              'Close',
              {
                duration: 3000,
              }
            );
          },
        });
    } else {
      this.snackBar.open(
        'Please fill in all required fields correctly',
        'Close',
        {
          duration: 3000,
        }
      );
    }
  }
}
