import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { finalize } from 'rxjs/operators';
import * as AuthActions from '../../../store/auth/auth.actions';
import { QuestionnaireService } from '../../../core/services/questionnaire.service';
import { QuestionnaireRequest, OrganizationType, FocusArea, Language } from '../../../core/models/questionnaire.model';
import { selectAuthError, selectAuthLoading, selectUser } from '../../../store/auth/auth.selectors';
import { LocationService } from '../../../core/services/location.service';
import { Observable } from 'rxjs';
import { AppState } from '../../../store/app.state';

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
    MatFormFieldModule
  ],
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss']
})
export class QuestionnaireComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  questionnaireForm!: FormGroup;
  roleFormGroup!: FormGroup;
  contactFormGroup!: FormGroup;
  roleSpecificFormGroup!: FormGroup;

  isSubmitting = false;
  errorMessage = '';
  currentYear = new Date().getFullYear();
  currentStep = 1;
  totalSteps = 3;

  // For chips input
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  skills: string[] = [];
  interests: string[] = [];
  focusAreas: string[] = [];
  languages: string[] = [];
  preferredCauses: string[] = [];

  // Expose enums to the template
  organizationTypes = Object.values(OrganizationType);
  focusAreaOptions = Object.values(FocusArea);
  languageOptions = Object.values(Language);

  // Moroccan provinces/regions
  moroccanProvinces: string[] = [
    'Tanger-Tétouan-Al Hoceïma',
    'L\'Oriental',
    'Fès-Meknès',
    'Rabat-Salé-Kénitra',
    'Béni Mellal-Khénifra',
    'Casablanca-Settat',
    'Marrakech-Safi',
    'Drâa-Tafilalet',
    'Souss-Massa',
    'Guelmim-Oued Noun',
    'Laâyoune-Sakia El Hamra',
    'Dakhla-Oued Ed-Dahab'
  ];

  // Cities in the selected province
  citiesInProvince: string[] = [];

  // Loading state
  loading$: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    private questionnaireService: QuestionnaireService,
    private router: Router,
    private store: Store<AppState>,
    private snackBar: MatSnackBar,
    private locationService: LocationService
  ) {
    this.loading$ = this.store.select(state => state.auth.loading);
  }

  ngOnInit(): void {
    // Initialize form groups
    this.roleFormGroup = this.fb.group({
      type: ['', Validators.required]
    });

    this.contactFormGroup = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^(\+212|0)[1-9](\d{2}){4}$/)]],
      address: ['', Validators.required],
      province: ['', Validators.required],
      city: ['', Validators.required]
    });

    this.roleSpecificFormGroup = this.fb.group({
      organization: this.fb.group({
        type: [''],
        foundedYear: [''],
        website: ['', Validators.pattern(/^https?:\/\/.+/i)],
        missionStatement: [''],
        socialMedia: this.fb.group({
          facebook: ['', Validators.pattern(/^https?:\/\/(www\.)?facebook\.com\/.+/i)],
          twitter: ['', Validators.pattern(/^https?:\/\/(www\.)?twitter\.com\/.+/i)],
          instagram: ['', Validators.pattern(/^https?:\/\/(www\.)?instagram\.com\/.+/i)],
          linkedin: ['', Validators.pattern(/^https?:\/\/(www\.)?linkedin\.com\/.+/i)]
        })
      }),
      volunteer: this.fb.group({
        bio: [''],
        education: [''],
        experience: [''],
        specialNeeds: [''],
        skills: [[]],
        interests: [[]],
        languages: [[]],
        emergencyContact: this.fb.group({
          name: [''],
          relationship: [''],
          phone: ['', Validators.pattern(/^(\+212|0)[1-9](\d{2}){4}$/)]
        })
      })
    });

    // Main form group
    this.questionnaireForm = this.fb.group({
      role: this.roleFormGroup,
      contact: this.contactFormGroup,
      roleSpecific: this.roleSpecificFormGroup
    });

    // Add validators based on role selection
    this.roleFormGroup.get('type')?.valueChanges.subscribe(role => {
      if (role === 'ORGANIZATION') {
        // Add organization validators
        const orgGroup = this.roleSpecificFormGroup.get('organization');
        orgGroup?.get('type')?.setValidators([Validators.required]);
        orgGroup?.get('missionStatement')?.setValidators([Validators.required]);
        
        // Clear volunteer validators
        const volGroup = this.roleSpecificFormGroup.get('volunteer');
        volGroup?.get('bio')?.clearValidators();
        volGroup?.get('emergencyContact.name')?.clearValidators();
        volGroup?.get('emergencyContact.phone')?.clearValidators();
      } else if (role === 'VOLUNTEER') {
        // Clear organization validators
        const orgGroup = this.roleSpecificFormGroup.get('organization');
        orgGroup?.get('type')?.clearValidators();
        orgGroup?.get('missionStatement')?.clearValidators();
        
        // Add volunteer validators
        const volGroup = this.roleSpecificFormGroup.get('volunteer');
        volGroup?.get('bio')?.setValidators([Validators.required]);
        volGroup?.get('emergencyContact.name')?.setValidators([Validators.required]);
        volGroup?.get('emergencyContact.phone')?.setValidators([
          Validators.required,
          Validators.pattern(/^(\+212|0)[1-9](\d{2}){4}$/)
        ]);
      }

      // Update validity
      this.updateFormValidity();
    });

    // Subscribe to province changes
    this.contactFormGroup.get('province')?.valueChanges.subscribe(province => {
      if (province) {
        this.onProvinceChange();
      }
    });

    // Get current user to pre-populate some fields
    this.store.select(selectUser).subscribe(user => {
      if (user) {
        this.roleFormGroup.get('type')?.setValue(user.role);
      }
    });

    // Clear error message when form becomes valid
    this.questionnaireForm.statusChanges.subscribe(status => {
      if (status === 'VALID') {
        this.errorMessage = '';
      }
    });
  }

  /**
   * Updates the validity of all form controls
   */
  updateFormValidity(): void {
    // Organization fields
    const orgGroup = this.roleSpecificFormGroup.get('organization');
    orgGroup?.get('type')?.updateValueAndValidity();
    orgGroup?.get('missionStatement')?.updateValueAndValidity();

    // Volunteer fields
    const volGroup = this.roleSpecificFormGroup.get('volunteer');
    volGroup?.get('bio')?.updateValueAndValidity();
    volGroup?.get('emergencyContact')?.updateValueAndValidity();

    // Update parent form groups
    this.roleSpecificFormGroup.updateValueAndValidity();
    this.questionnaireForm.updateValueAndValidity();

    console.log('Form validity updated');
    console.log('Role form valid:', this.roleFormGroup.valid);
    console.log('Contact form valid:', this.contactFormGroup.valid);
    console.log('Role-specific form valid:', this.roleSpecificFormGroup.valid);
    console.log('Main form valid:', this.questionnaireForm.valid);
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
      volGroup?.get('emergencyContact')?.clearValidators();
    } else if (currentRole === 'VOLUNTEER') {
      // Clear organization validators
      const orgGroup = this.roleSpecificFormGroup.get('organization');
      orgGroup?.get('type')?.clearValidators();
      orgGroup?.get('missionStatement')?.clearValidators();
      
      // Add volunteer validators
      const volGroup = this.roleSpecificFormGroup.get('volunteer');
      volGroup?.get('bio')?.setValidators([Validators.required]);
      volGroup?.get('emergencyContact.name')?.setValidators([Validators.required]);
      volGroup?.get('emergencyContact.phone')?.setValidators([
        Validators.required,
        Validators.pattern(/^(\+212|0)[1-9](\d{2}){4}$/)
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
      this.roleSpecificFormGroup.get('volunteer.interests')?.setValue(this.interests);
    }
  }

  removeInterest(interest: string): void {
    const index = this.interests.indexOf(interest);
    if (index >= 0) {
      this.interests.splice(index, 1);
      this.roleSpecificFormGroup.get('volunteer.interests')?.setValue(this.interests);
    }
  }

  addFocusArea(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.focusAreas.push(value);
    }
    event.chipInput!.clear();
  }

  removeFocusArea(area: string): void {
    const index = this.focusAreas.indexOf(area);
    if (index >= 0) {
      this.focusAreas.splice(index, 1);
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
    if (this.questionnaireForm.invalid) {
      this.markFormGroupTouched(this.questionnaireForm);
      return;
    }

    this.isSubmitting = true;
    const formData = this.prepareFormData();

    this.questionnaireService.submitQuestionnaire(formData)
      .pipe(
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: (response) => {
          this.snackBar.open('Profile completed successfully!', 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          this.store.dispatch(AuthActions.updateUserProfile({ profile: response }));
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error submitting questionnaire:', error);
          this.snackBar.open(error.message || 'Failed to submit questionnaire. Please try again.', 'Close', {
            duration: 7000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  private prepareFormData(): QuestionnaireRequest {
    const formValue = this.questionnaireForm.value;
    const role = this.roleFormGroup.get('type')?.value;
    
    const baseData = {
      role,
      contact: {
        phoneNumber: this.contactFormGroup.get('phoneNumber')?.value,
        address: this.contactFormGroup.get('address')?.value,
        province: this.contactFormGroup.get('province')?.value,
        city: this.contactFormGroup.get('city')?.value
      }
    };

    if (role === 'ORGANIZATION') {
      const orgData = this.roleSpecificFormGroup.get('organization')?.value;
      return {
        ...baseData,
        organizationDetails: {
          ...orgData,
          focusAreas: this.focusAreas
        }
      };
    } else {
      const volData = this.roleSpecificFormGroup.get('volunteer')?.value;
      return {
        ...baseData,
        volunteerDetails: {
          ...volData,
          skills: this.skills,
          interests: this.interests,
          languages: this.languages
        }
      };
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  /**
   * Load cities when a province is selected
   */
  onProvinceChange(): void {
    const province = this.contactFormGroup.get('province')?.value;
    if (province) {
      // Reset city value when province changes
      this.contactFormGroup.get('city')?.setValue('');

      this.locationService.getCitiesByProvince(province).subscribe(
        cities => {
          this.citiesInProvince = cities;
          console.log(`Loaded ${cities.length} cities for province ${province}`);
        },
        error => {
          console.error('Error loading cities:', error);
          this.snackBar.open('Failed to load cities for the selected province', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      );
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
    this.snackBar.open(`Province: ${province}, Cities: ${this.citiesInProvince.length}, Selected: ${this.contactFormGroup.get('city')?.value || 'None'}, Form Valid: ${this.isContactFormValid()}`, 'Close', {
      duration: 5000
    });
  }

  /**
   * Checks if the contact form is valid
   * @returns boolean indicating if the contact form is valid
   */
  isContactFormValid(): boolean {
    const contact = this.contactFormGroup.get('contact');
    if (!contact) return false;

    // Check individual fields
    const phoneNumber = contact.get('phoneNumber');
    const city = contact.get('city');
    const province = contact.get('province');

    if (!phoneNumber || !city || !province) return false;

    const phoneValid = phoneNumber.valid && !!phoneNumber.value;
    const cityValid = city.valid && !!city.value;
    const provinceValid = province.valid && !!province.value;

    // Log validation status
    console.log('Contact form validation:', {
      phoneValid,
      cityValid,
      provinceValid,
      overallValid: phoneValid && cityValid && provinceValid
    });

    return phoneValid && cityValid && provinceValid;
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
          panelClass: ['error-snackbar']
        });
        return;
      }
    } else if (currentIndex === 1) {
      // Step 2: Contact Information
      if (!this.isContactFormValid()) {
        this.snackBar.open('Please complete all required contact information', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
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
      return this.validateForm();
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

    this.snackBar.open(`Step ${currentIndex + 1} of ${totalSteps}, Valid: ${isCurrentStepValid}`, 'Close', {
      duration: 3000
    });
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

  isRoleSpecificFormValid(): boolean {
    const role = this.roleFormGroup.get('type')?.value;
    if (!role) return false;

    if (role === 'ORGANIZATION') {
      const org = this.roleSpecificFormGroup.get('organization');
      return org?.valid || false;
    } else if (role === 'VOLUNTEER') {
      const vol = this.roleSpecificFormGroup.get('volunteer');
      return vol?.valid || false;
    }

    return false;
  }

  private validateForm(): boolean {
    const role = this.roleFormGroup.get('type')?.value;
    if (!role) return false;

    return role === 'ORGANIZATION' ? 
      this.roleSpecificFormGroup.get('organization')?.valid || false :
      this.roleSpecificFormGroup.get('volunteer')?.valid || false;
  }
}
