import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { finalize, takeUntil, filter, take } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as AuthActions from '../../../store/auth/auth.actions';
import { QuestionnaireService } from '../../../core/services/questionnaire.service';
import {
  QuestionnaireRequest,
  OrganizationType,
  FocusArea,
  Language,
} from '../../../core/models/questionnaire.model';
import {
  selectAuthError,
  selectAuthLoading,
  selectUser,
} from '../../../store/auth/auth.selectors';
import { LocationService } from '../../../core/services/location.service';
import { Observable } from 'rxjs';
import { AppState } from '../../../store/app.state';
import { AuthService } from '../../../core/services/auth.service';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-questionnaire',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatChipsModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatFormFieldModule,
  ],
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss'],
})
export class QuestionnaireComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;

  questionnaireForm!: FormGroup;
  roleFormGroup!: FormGroup;
  contactFormGroup!: FormGroup;
  roleSpecificFormGroup!: FormGroup;

  currentRole: string = '';
  isSubmitting = false;
  errorMessage = '';
  currentYear = new Date().getFullYear();
  currentStep = 1;
  totalSteps = 3;

  // For chips input
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  skills: string[] = [];
  interests: string[] = [];
  languages: string[] = [];
  preferredCauses: string[] = [];

  // Expose enums to the template
  organizationTypes = Object.values(OrganizationType);
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
  languageOptions = Object.values(Language);

  // Moroccan provinces/regions
  moroccanProvinces: string[] = [
    'Tanger-Tétouan-Al Hoceïma',
    "L'Oriental",
    'Fès-Meknès',
    'Rabat-Salé-Kénitra',
    'Béni Mellal-Khénifra',
    'Casablanca-Settat',
    'Marrakech-Safi',
    'Drâa-Tafilalet',
    'Souss-Massa',
    'Guelmim-Oued Noun',
    'Laâyoune-Sakia El Hamra',
    'Dakhla-Oued Ed-Dahab',
  ];

  // Cities in the selected province
  citiesInProvince: string[] = [];

  // Loading state
  loading$: Observable<boolean>;
  isLoadingCities = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private questionnaireService: QuestionnaireService,
    private router: Router,
    private store: Store<AppState>,
    private snackBar: MatSnackBar,
    private locationService: LocationService,
    private authService: AuthService
  ) {
    this.loading$ = this.store.select((state) => state.auth.loading);

    // Subscribe to auth state to handle questionnaire submission
    this.store
      .select((state) => state.auth)
      .subscribe((authState) => {
        if (authState.error) {
          this.isSubmitting = false;
          this.errorMessage = authState.error;
          this.snackBar.open(this.errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        }
      });
  }

  ngOnInit(): void {
    // Initialize form groups
    this.roleFormGroup = this.fb.group({
      type: ['', Validators.required],
    });

    this.contactFormGroup = this.fb.group({
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^(?:\+212|0)[5-7]\d{8}$/)],
      ],
      address: ['', Validators.required],
      city: ['', Validators.required],
      province: ['', Validators.required],
      country: ['Morocco', Validators.required],
    });

    // Initialize role-specific form groups
    this.roleSpecificFormGroup = this.fb.group({
      volunteer: this.fb.group({
        bio: [
          '',
          [
            Validators.required,
            Validators.minLength(50),
            Validators.maxLength(1000),
          ],
        ],
        education: [''],
        experience: [''],
        specialNeeds: [''],
        skills: [[]],
        interests: [[]],
        availableDays: [[]],
        preferredTimeOfDay: ['FLEXIBLE'],
        languages: [[]],
        certifications: [[]],
        availableForEmergency: [false],
        emergencyContact: this.fb.group({
          name: [
            '',
            [
              Validators.required,
              Validators.minLength(2),
              Validators.maxLength(100),
            ],
          ],
          relationship: [''],
          phone: [
            '',
            [
              Validators.required,
              Validators.pattern(/^(?:\+212|0)[5-7]\d{8}$/),
            ],
          ],
        }),
      }),
      organization: this.fb.group({
        type: ['', [Validators.required]],
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100),
            Validators.pattern(/^[a-zA-Z0-9\s\-_'.&]+$/),
          ],
        ],
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
        vision: ['', [Validators.maxLength(1000)]],
        website: [
          '',
          [
            Validators.pattern(
              /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
            ),
          ],
        ],
        registrationNumber: ['', [Validators.pattern(/^[A-Z0-9\-\/]+$/)]],
        taxId: ['', [Validators.pattern(/^[A-Z0-9\-\/]+$/)]],
        focusAreas: [[], [Validators.required, Validators.minLength(1)]],
        foundedYear: [
          null,
          [Validators.min(1800), Validators.max(new Date().getFullYear())],
        ],
        socialMedia: this.fb.group({
          facebook: [
            '',
            [Validators.pattern(/^(https?:\/\/)?(www\.)?facebook\.com\/.*$/)],
          ],
          twitter: [
            '',
            [Validators.pattern(/^(https?:\/\/)?(www\.)?twitter\.com\/.*$/)],
          ],
          instagram: [
            '',
            [Validators.pattern(/^(https?:\/\/)?(www\.)?instagram\.com\/.*$/)],
          ],
          linkedin: [
            '',
            [Validators.pattern(/^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/)],
          ],
        }),
      }),
    });

    // Create main form group
    this.questionnaireForm = this.fb.group({
      role: this.roleFormGroup,
      contact: this.contactFormGroup,
      roleSpecific: this.roleSpecificFormGroup,
    });

    // Subscribe to role changes
    this.roleFormGroup.get('type')?.valueChanges.subscribe((role) => {
      this.currentRole = role;
      this.updateFormValidity();

      // Reset the non-selected role's form
      if (role === 'ORGANIZATION') {
        this.roleSpecificFormGroup.get('volunteer')?.reset();
      } else if (role === 'VOLUNTEER') {
        this.roleSpecificFormGroup.get('organization')?.reset();
      }
    });

    // Clear error message when form becomes valid
    this.questionnaireForm.statusChanges.subscribe((status) => {
      if (status === 'VALID') {
        this.errorMessage = '';
      }
    });
  }

  /**
   * Updates the validity of all form controls
   */
  updateFormValidity(): void {
    const role = this.roleFormGroup.get('type')?.value;
    const volunteerGroup = this.roleSpecificFormGroup.get('volunteer');
    const organizationGroup = this.roleSpecificFormGroup.get('organization');

    if (role === 'ORGANIZATION') {
      // Add validators for organization fields
      organizationGroup?.get('type')?.setValidators([Validators.required]);
      organizationGroup
        ?.get('name')
        ?.setValidators([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ]);
      organizationGroup
        ?.get('description')
        ?.setValidators([
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(2000),
        ]);
      organizationGroup
        ?.get('missionStatement')
        ?.setValidators([
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(1000),
        ]);
      organizationGroup
        ?.get('website')
        ?.setValidators([
          Validators.pattern(
            '^(https?:\\/\\/)?([\\w\\-])+\\.{1}([a-zA-Z]{2,63})([\\/\\w-]*)*\\/?$'
          ),
        ]);
      organizationGroup
        ?.get('registrationNumber')
        ?.setValidators([Validators.pattern('^[A-Z0-9-]{5,20}$')]);
      organizationGroup
        ?.get('taxId')
        ?.setValidators([Validators.pattern('^[A-Z0-9-]{5,20}$')]);
      organizationGroup
        ?.get('foundedYear')
        ?.setValidators([
          Validators.min(1800),
          Validators.max(new Date().getFullYear()),
        ]);

      // Add validators for social media URLs
      const socialMediaGroup = organizationGroup?.get('socialMedia');
      socialMediaGroup
        ?.get('facebook')
        ?.setValidators([
          Validators.pattern(
            '^(https?:\\/\\/)?(www\\.)?facebook\\.com\\/[a-zA-Z0-9.-]+\\/?$'
          ),
        ]);
      socialMediaGroup
        ?.get('twitter')
        ?.setValidators([
          Validators.pattern(
            '^(https?:\\/\\/)?(www\\.)?twitter\\.com\\/[a-zA-Z0-9_]+\\/?$'
          ),
        ]);
      socialMediaGroup
        ?.get('instagram')
        ?.setValidators([
          Validators.pattern(
            '^(https?:\\/\\/)?(www\\.)?instagram\\.com\\/[a-zA-Z0-9_.]+\\/?$'
          ),
        ]);
      socialMediaGroup
        ?.get('linkedin')
        ?.setValidators([
          Validators.pattern(
            '^(https?:\\/\\/)?(www\\.)?linkedin\\.com\\/(?:company|in)\\/[a-zA-Z0-9-]+\\/?$'
          ),
        ]);

      // Clear volunteer validators
      volunteerGroup?.get('bio')?.clearValidators();
      volunteerGroup?.get('emergencyContact.name')?.clearValidators();
      volunteerGroup?.get('emergencyContact.phone')?.clearValidators();
      volunteerGroup?.get('education')?.clearValidators();
      volunteerGroup?.get('experience')?.clearValidators();
      volunteerGroup?.get('specialNeeds')?.clearValidators();
    } else if (role === 'VOLUNTEER') {
      // Add validators for volunteer fields
      volunteerGroup
        ?.get('bio')
        ?.setValidators([
          Validators.required,
          Validators.minLength(50),
          Validators.maxLength(1000),
        ]);
      volunteerGroup
        ?.get('education')
        ?.setValidators([Validators.maxLength(500)]);
      volunteerGroup
        ?.get('experience')
        ?.setValidators([Validators.maxLength(1000)]);
      volunteerGroup
        ?.get('specialNeeds')
        ?.setValidators([Validators.maxLength(500)]);

      const emergencyContactGroup = volunteerGroup?.get('emergencyContact');
      emergencyContactGroup
        ?.get('name')
        ?.setValidators([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ]);
      emergencyContactGroup
        ?.get('relationship')
        ?.setValidators([Validators.maxLength(50)]);
      emergencyContactGroup
        ?.get('phone')
        ?.setValidators([
          Validators.required,
          Validators.pattern(/^(?:\+212|0)[5-7]\d{8}$/),
        ]);

      // Clear organization validators
      organizationGroup?.get('type')?.clearValidators();
      organizationGroup?.get('name')?.clearValidators();
      organizationGroup?.get('description')?.clearValidators();
      organizationGroup?.get('missionStatement')?.clearValidators();
      organizationGroup?.get('website')?.clearValidators();
      organizationGroup?.get('registrationNumber')?.clearValidators();
      organizationGroup?.get('taxId')?.clearValidators();
      organizationGroup?.get('foundedYear')?.clearValidators();

      const socialMediaGroup = organizationGroup?.get('socialMedia');
      socialMediaGroup?.get('facebook')?.clearValidators();
      socialMediaGroup?.get('twitter')?.clearValidators();
      socialMediaGroup?.get('instagram')?.clearValidators();
      socialMediaGroup?.get('linkedin')?.clearValidators();
    }

    // Update validity for all controls
    this.roleSpecificFormGroup.updateValueAndValidity();
    volunteerGroup?.updateValueAndValidity();
    organizationGroup?.updateValueAndValidity();

    // Log form validity state for debugging
    console.log('Form validity state:', {
      role: this.roleFormGroup.valid,
      contact: this.contactFormGroup.valid,
      volunteer: volunteerGroup?.valid,
      organization: organizationGroup?.valid,
      overall: this.questionnaireForm.valid,
    });
  }

  /**
   * Handle role change manually
   */
  onRoleChange(role?: string): void {
    const currentRole = role || this.roleFormGroup.get('type')?.value;

    if (currentRole === 'ORGANIZATION') {
      // Add organization validators
      const orgGroup = this.roleSpecificFormGroup.get('organization');
      orgGroup?.get('type')?.setValidators([Validators.required]);
      orgGroup?.get('missionStatement')?.setValidators([Validators.required]);

      // Clear volunteer validators
      const volGroup = this.roleSpecificFormGroup.get('volunteer');
      volGroup?.get('bio')?.clearValidators();
      volGroup?.get('emergencyContact.name')?.clearValidators();
      volGroup?.get('emergencyContact.phone')?.clearValidators();
    } else if (currentRole === 'VOLUNTEER') {
      // Clear organization validators
      const orgGroup = this.roleSpecificFormGroup.get('organization');
      orgGroup?.get('type')?.clearValidators();
      orgGroup?.get('missionStatement')?.clearValidators();

      // Add volunteer validators
      const volGroup = this.roleSpecificFormGroup.get('volunteer');
      volGroup?.get('bio')?.setValidators([Validators.required]);
      volGroup
        ?.get('emergencyContact.name')
        ?.setValidators([Validators.required]);
      volGroup
        ?.get('emergencyContact.phone')
        ?.setValidators([
          Validators.required,
          Validators.pattern(/^(\+212|0)[1-9](\d{2}){4}$/),
        ]);
    }

    // Update validity for all fields
    this.updateFormValidity();
  }

  isOrganization(): boolean {
    return this.roleFormGroup.get('type')?.value === 'ORGANIZATION';
  }

  isVolunteer(): boolean {
    return this.roleFormGroup.get('type')?.value === 'VOLUNTEER';
  }

  // Chip input methods
  addSkill(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.skills.push(value);
      event.chipInput!.clear();
      this.roleSpecificFormGroup.get('volunteer.skills')?.setValue(this.skills);
    }
  }

  removeSkill(skill: string): void {
    const index = this.skills.indexOf(skill);
    if (index >= 0) {
      this.skills.splice(index, 1);
      this.roleSpecificFormGroup.get('volunteer.skills')?.setValue(this.skills);
    }
  }

  addInterest(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.interests.push(value);
      event.chipInput!.clear();
      this.roleSpecificFormGroup
        .get('volunteer.interests')
        ?.setValue(this.interests);
    }
  }

  removeInterest(interest: string): void {
    const index = this.interests.indexOf(interest);
    if (index >= 0) {
      this.interests.splice(index, 1);
      this.roleSpecificFormGroup
        .get('volunteer.interests')
        ?.setValue(this.interests);
    }
  }

  addLanguage(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.languages.push(value);
    }
    event.chipInput!.clear();
  }

  removeLanguage(language: string): void {
    const index = this.languages.indexOf(language);
    if (index >= 0) {
      this.languages.splice(index, 1);
    }
  }

  addPreferredCause(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.preferredCauses.push(value);
    }
    event.chipInput!.clear();
  }

  removePreferredCause(cause: string): void {
    const index = this.preferredCauses.indexOf(cause);
    if (index >= 0) {
      this.preferredCauses.splice(index, 1);
    }
  }

  /**
   * Checks if the stepper is on the final step
   * @returns boolean indicating if we're on the final step
   */
  isOnFinalStep(): boolean {
    if (!this.stepper) return false;
    return this.stepper.selectedIndex === this.stepper.steps.length - 1;
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    // Mark all fields as touched to trigger validation
    this.markFormGroupTouched(this.questionnaireForm);

    // Check form validity and provide specific feedback
    const roleValid = this.roleFormGroup.valid;
    const contactValid = this.contactFormGroup.valid;
    const roleSpecificValid = this.roleSpecificFormGroup.valid;

    if (!roleValid) {
      this.snackBar.open('Please select a role to continue.', 'Close', {
        duration: 3000,
      });
      return;
    }

    if (!contactValid) {
      this.snackBar.open(
        'Please complete all required contact information.',
        'Close',
        { duration: 3000 }
      );
      return;
    }

    if (!roleSpecificValid) {
      const role = this.roleFormGroup.get('type')?.value;
      const message =
        role === 'ORGANIZATION'
          ? 'Please complete all required organization information.'
          : 'Please complete all required volunteer information.';
      this.snackBar.open(message, 'Close', { duration: 3000 });
      return;
    }

    if (this.questionnaireForm.valid) {
      this.isSubmitting = true;
      const loadingRef = this.snackBar.open('Submitting questionnaire...', '', {
        duration: undefined,
        panelClass: ['info-snackbar'],
      });

      // Prepare form data
      const formData = this.prepareFormData();

      // Dispatch submit action
      this.store.dispatch(AuthActions.submitQuestionnaire({ formData }));

      // Subscribe to loading and error states
      this.store
        .select(selectAuthLoading)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.isSubmitting = false;
            loadingRef.dismiss();
          })
        )
        .subscribe();

      // Handle success case
      this.store
        .select(selectUser)
        .pipe(
          takeUntil(this.destroy$),
          filter((user) => !!user),
          take(1)
        )
        .subscribe((user) => {
          if (!user) return;
          // Refresh token to update role
          this.authService.refreshToken(user.id.toString()).subscribe({
            next: () => {
              this.snackBar.open('Profile completed successfully!', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar'],
              });
              this.router.navigate(['/dashboard']);
            },
            error: (error) => {
              console.error('Error refreshing token:', error);
              this.snackBar.open(
                'Profile saved but please log out and log in again to access all features.',
                'Close',
                {
                  duration: 5000,
                  panelClass: ['warning-snackbar'],
                }
              );
              this.router.navigate(['/dashboard']);
            },
          });
        });

      // Handle error case
      this.store
        .select(selectAuthError)
        .pipe(
          takeUntil(this.destroy$),
          filter((error) => !!error)
        )
        .subscribe((error) => {
          this.isSubmitting = false;
          this.errorMessage =
            error || 'An error occurred while submitting the questionnaire.';
          this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
        });
    } else {
      this.snackBar.open(
        'Please fill in all required fields correctly.',
        'Close',
        { duration: 3000 }
      );
    }
  }

  private markFormGroupTouched(
    formGroup: AbstractControl,
    parentPath: string = ''
  ): void {
    if (formGroup instanceof FormGroup) {
      Object.values(formGroup.controls).forEach((control, index) => {
        const controlName = Object.keys(formGroup.controls)[index];
        const path = parentPath ? `${parentPath}.${controlName}` : controlName;

        if (control instanceof FormGroup) {
          this.markFormGroupTouched(control, path);
        } else {
          if (control.invalid) {
            console.log(`Invalid control at path: ${path}`, {
              errors: control.errors,
              value: control.value,
            });
          }
          control.markAsTouched();
        }
      });
    }
  }

  private prepareFormData(): QuestionnaireRequest {
    const formValue = this.questionnaireForm.value;
    const role = this.roleFormGroup.get('type')?.value;

    const baseData = {
      role,
      phoneNumber: this.contactFormGroup.get('phoneNumber')?.value,
      address: this.contactFormGroup.get('address')?.value,
      city: this.contactFormGroup.get('city')?.value,
      province: this.contactFormGroup.get('province')?.value,
      country: this.contactFormGroup.get('country')?.value,
    };

    if (role === 'ORGANIZATION') {
      const orgData = this.roleSpecificFormGroup.get('organization')?.value;
      return {
        ...baseData,
        type: orgData.type,
        name: orgData.name,
        description: orgData.description,
        missionStatement: orgData.missionStatement,
        vision: orgData.vision || '',
        website: orgData.website || '',
        registrationNumber: orgData.registrationNumber || '',
        taxId: orgData.taxId || '',
        focusAreas: new Set(orgData.focusAreas || []),
        foundedYear: orgData.foundedYear || null,
        socialMediaLinks: {
          facebook: orgData.socialMedia?.facebook || '',
          twitter: orgData.socialMedia?.twitter || '',
          instagram: orgData.socialMedia?.instagram || '',
          linkedin: orgData.socialMedia?.linkedin || '',
        },
      };
    } else {
      const volData = this.roleSpecificFormGroup.get('volunteer')?.value;
      return {
        ...baseData,
        bio: volData.bio,
        education: volData.education || '',
        experience: volData.experience || '',
        specialNeeds: volData.specialNeeds || '',
        skills: Array.isArray(volData.skills) ? volData.skills : [],
        interests: Array.isArray(volData.interests) ? volData.interests : [],
        availableDays: Array.isArray(volData.availableDays)
          ? volData.availableDays
          : [],
        preferredTimeOfDay: volData.preferredTimeOfDay || 'FLEXIBLE',
        languages: Array.isArray(volData.languages) ? volData.languages : [],
        certifications: Array.isArray(volData.certifications)
          ? volData.certifications
          : [],
        availableForEmergency: volData.availableForEmergency || false,
        emergencyContact: {
          name: volData.emergencyContact.name,
          relationship: volData.emergencyContact.relationship || '',
          phone: volData.emergencyContact.phone,
        },
      };
    }
  }

  /**
   * Load cities when a province is selected
   */
  onProvinceChange(): void {
    const province = this.contactFormGroup.get('province')?.value;
    if (province) {
      // Reset city value and validation when province changes
      const cityControl = this.contactFormGroup.get('city');
      cityControl?.setValue('');
      cityControl?.markAsUntouched();

      // Show loading indicator
      this.isLoadingCities = true;

      this.locationService
        .getCitiesByProvince(province)
        .pipe(finalize(() => (this.isLoadingCities = false)))
        .subscribe({
          next: (cities) => {
            this.citiesInProvince = cities;
            console.log(
              `Loaded ${cities.length} cities for province ${province}`
            );

            // If there's only one city, select it automatically
            if (cities.length === 1) {
              cityControl?.setValue(cities[0]);
            }
          },
          error: (error) => {
            console.error('Error loading cities:', error);
            this.snackBar.open(
              'Failed to load cities for the selected province. Please try again.',
              'Close',
              {
                duration: 5000,
                panelClass: ['error-snackbar'],
              }
            );
            // Reset cities on error
            this.citiesInProvince = [];
            cityControl?.setValue('');
          },
        });
    } else {
      this.citiesInProvince = [];
      this.contactFormGroup.get('city')?.setValue('');
    }
  }

  /**
   * Debug method to log city loading information
   */
  debugCityLoading(): void {
    console.log('--- City Loading Debug ---');
    const province = this.contactFormGroup.get('province')?.value;
    console.log('Selected province:', province);
    console.log('Available cities:', this.citiesInProvince);
    console.log('Selected city:', this.contactFormGroup.get('city')?.value);
    console.log('Contact form valid:', this.isContactFormValid());
    console.log('Contact form group valid:', this.contactFormGroup.valid);
    console.log('--- End City Loading Debug ---');

    // Show a snackbar with the debug info
    this.snackBar.open(
      `Province: ${province}, Cities: ${
        this.citiesInProvince.length
      }, Selected: ${
        this.contactFormGroup.get('city')?.value || 'None'
      }, Form Valid: ${this.isContactFormValid()}`,
      'Close',
      {
        duration: 5000,
      }
    );
  }

  /**
   * Checks if the contact form is valid
   * @returns boolean indicating if the contact form is valid
   */
  isContactFormValid(): boolean {
    // Check if all required fields are valid
    const phoneNumber = this.contactFormGroup.get('phoneNumber');
    const address = this.contactFormGroup.get('address');
    const city = this.contactFormGroup.get('city');
    const province = this.contactFormGroup.get('province');

    if (!phoneNumber || !address || !city || !province) return false;

    const phoneValid = phoneNumber.valid && !!phoneNumber.value;
    const addressValid = address.valid && !!address.value;
    const cityValid = city.valid && !!city.value;
    const provinceValid = province.valid && !!province.value;

    return phoneValid && addressValid && cityValid && provinceValid;
  }

  /**
   * Navigate to the next step
   */
  goToNextStep(): void {
    if (!this.stepper) return;

    const currentIndex = this.stepper.selectedIndex;

    // Mark all fields in the current step as touched to show validation
    if (currentIndex === 0) {
      this.markFormGroupTouched(this.roleFormGroup);
    } else if (currentIndex === 1) {
      this.markFormGroupTouched(this.contactFormGroup);
    }

    // Validate based on current step
    if (currentIndex === 0) {
      // Step 1: Role Selection
      if (!this.isRoleFormValid()) {
        this.snackBar.open('Please select a role before proceeding', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        return;
      }
    } else if (currentIndex === 1) {
      // Step 2: Contact Information
      if (!this.isContactFormValid()) {
        this.snackBar.open(
          'Please complete all required contact information',
          'Close',
          {
            duration: 3000,
            panelClass: ['error-snackbar'],
          }
        );
        return;
      }
    }

    // If validation passes, go to next step
    this.stepper.next();
    console.log(`Navigated to step ${this.stepper.selectedIndex + 1}`);
  }

  /**
   * Checks if the role form is valid
   * @returns boolean indicating if the role form is valid
   */
  isRoleFormValid(): boolean {
    return !!this.roleFormGroup.get('type')?.value;
  }

  /**
   * Checks if the current step is valid
   * @returns boolean indicating if the current step is valid
   */
  isCurrentStepValid(): boolean {
    if (!this.stepper) return false;

    const currentIndex = this.stepper.selectedIndex;

    if (currentIndex === 0) {
      return this.isRoleFormValid();
    } else if (currentIndex === 1) {
      return this.isContactFormValid();
    } else if (currentIndex === 2) {
      return this.isRoleSpecificFormValid();
    }

    return false;
  }

  /**
   * Debug method to show the current step
   */
  debugCurrentStep(): void {
    if (!this.stepper) {
      console.log('Stepper not initialized');
      return;
    }

    const currentIndex = this.stepper.selectedIndex;
    const totalSteps = this.stepper.steps.length;
    const isCurrentStepValid = this.isCurrentStepValid();

    console.log('--- Current Step Debug ---');
    console.log(`Current step: ${currentIndex + 1} of ${totalSteps}`);
    console.log(`Current step valid: ${isCurrentStepValid}`);
    console.log('--- End Current Step Debug ---');

    this.snackBar.open(
      `Step ${currentIndex + 1} of ${totalSteps}, Valid: ${isCurrentStepValid}`,
      'Close',
      {
        duration: 3000,
      }
    );
  }

  /**
   * Gets the current step progress as a percentage
   * @returns number representing the progress percentage
   */
  getStepProgress(): number {
    if (!this.stepper) return 0;
    const currentIndex = this.stepper.selectedIndex || 0;
    const totalSteps = 3; // Total number of steps
    return (currentIndex / (totalSteps - 1)) * 100;
  }

  getProgressValue(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  /**
   * Validates the organization-specific form
   */
  isOrganizationFormValid(): boolean {
    const organizationForm = this.roleSpecificFormGroup.get('organization');
    if (!organizationForm) return false;

    const requiredFields = [
      'type',
      'name',
      'description',
      'missionStatement',
      'focusAreas',
    ];
    const isRequiredFieldsValid = requiredFields.every((field) => {
      const control = organizationForm.get(field);
      return control && control.valid && !control.hasError('required');
    });

    const focusAreas = organizationForm.get('focusAreas')?.value;
    const hasFocusAreas = Array.isArray(focusAreas) && focusAreas.length > 0;

    return isRequiredFieldsValid && hasFocusAreas;
  }

  /**
   * Validates the role-specific form based on the selected role
   */
  isRoleSpecificFormValid(): boolean {
    if (this.currentRole === 'ORGANIZATION') {
      return this.isOrganizationFormValid();
    } else if (this.currentRole === 'VOLUNTEER') {
      return this.isVolunteerFormValid();
    }
    return false;
  }

  /**
   * Validates the volunteer-specific form
   */
  isVolunteerFormValid(): boolean {
    const volunteerForm = this.roleSpecificFormGroup.get('volunteer');
    if (!volunteerForm) return false;

    const requiredFields = ['bio', 'emergencyContact'];
    const isRequiredFieldsValid = requiredFields.every((field) => {
      const control = volunteerForm.get(field);
      return control && control.valid;
    });

    const emergencyContact = volunteerForm.get('emergencyContact');
    const isEmergencyContactValid =
      emergencyContact?.get('name')?.valid === true &&
      emergencyContact?.get('phone')?.valid === true;

    return isRequiredFieldsValid && isEmergencyContactValid;
  }

  ngOnDestroy(): void {
    this.destroy$.next(void 0);
    this.destroy$.complete();
  }
}
