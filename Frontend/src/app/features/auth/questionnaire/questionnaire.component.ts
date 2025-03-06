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
    MatProgressBarModule
  ],
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss'],
  host: { '[attr.aria-hidden]': 'true' }
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

  constructor(
    private fb: FormBuilder,
    private questionnaireService: QuestionnaireService,
    private router: Router,
    private store: Store,
    private snackBar: MatSnackBar,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    // Get current user to pre-populate some fields
    this.store.select(selectUser).subscribe(user => {
      if (user) {
        this.initForm(user.role);
      } else {
        this.initForm();
      }
    });

    // Clear error message when form becomes valid
    this.questionnaireForm.statusChanges.subscribe(status => {
      if (status === 'VALID') {
        this.errorMessage = '';
      }
    });

    // Load cities if province is already selected
    this.contactFormGroup.get('contact.province')?.valueChanges.subscribe(province => {
      if (province) {
        this.onProvinceChange();
      }
    });
  }

  initForm(userRole?: string): void {
    // Role form group
    this.roleFormGroup = this.fb.group({
      role: this.fb.group({
        type: [userRole || '', Validators.required]
      })
    });

    // Contact form group
    this.contactFormGroup = this.fb.group({
      contact: this.fb.group({
        phoneNumber: ['', [Validators.required, Validators.pattern(/^(\+212|0)[5-7][0-9]{8}$/)]],
        address: [''],
        city: ['', Validators.required],
        province: ['', Validators.required]
      })
    });

    // Role-specific form group - Initialize with empty validators, they'll be set based on role
    this.roleSpecificFormGroup = this.fb.group({
      organization: this.fb.group({
        name: [''],
        website: ['', Validators.pattern(/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/)],
        description: [''],
        organizationType: [''],
        foundedYear: ['', [Validators.min(1800), Validators.max(this.currentYear)]],
        missionStatement: [''],
        socialMedia: this.fb.group({
          facebook: ['', Validators.pattern(/^(https?:\/\/)?(www\.)?facebook\.com\/.*$/)],
          twitter: ['', Validators.pattern(/^(https?:\/\/)?(www\.)?twitter\.com\/.*$/)],
          instagram: ['', Validators.pattern(/^(https?:\/\/)?(www\.)?instagram\.com\/.*$/)],
          linkedin: ['', Validators.pattern(/^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/)]
        })
      }),
      volunteer: this.fb.group({
        bio: [''],
        education: [''],
        experience: [''],
        availability: [[]],
        drivingLicense: [false],
        specialNeeds: [''],
        emergencyContact: this.fb.group({
          name: [''],
          relationship: [''],
          phone: ['', Validators.pattern(/^(\+212|0)[5-7][0-9]{8}$/)]
        }),
        statistics: this.fb.group({
          experienceYears: [0, [Validators.min(0), Validators.max(100)]],
          hoursPerWeek: [0, [Validators.min(0), Validators.max(168)]],
          commitmentLength: [''],
          maxTravelDistance: [0, [Validators.min(0), Validators.max(1000)]]
        })
      })
    });

    // Main form
    this.questionnaireForm = this.fb.group({
      role: this.roleFormGroup.get('role'),
      contact: this.contactFormGroup.get('contact'),
      organization: this.roleSpecificFormGroup.get('organization'),
      volunteer: this.roleSpecificFormGroup.get('volunteer')
    });

    // Add validators based on role selection
    this.roleFormGroup.get('role.type')?.valueChanges.subscribe(role => {
      console.log('Role changed to:', role);

      if (role === 'ORGANIZATION') {
        // Add organization validators
        this.roleSpecificFormGroup.get('organization.name')?.setValidators([Validators.required]);
        this.roleSpecificFormGroup.get('organization.description')?.setValidators([Validators.required]);
        this.roleSpecificFormGroup.get('organization.organizationType')?.setValidators([Validators.required]);
        this.roleSpecificFormGroup.get('organization.missionStatement')?.setValidators([Validators.required]);

        // Clear volunteer validators
        this.roleSpecificFormGroup.get('volunteer.bio')?.clearValidators();
        this.roleSpecificFormGroup.get('volunteer.emergencyContact.name')?.clearValidators();
        this.roleSpecificFormGroup.get('volunteer.emergencyContact.phone')?.clearValidators();
      } else if (role === 'VOLUNTEER') {
        // Clear organization validators
        this.roleSpecificFormGroup.get('organization.name')?.clearValidators();
        this.roleSpecificFormGroup.get('organization.description')?.clearValidators();
        this.roleSpecificFormGroup.get('organization.organizationType')?.clearValidators();
        this.roleSpecificFormGroup.get('organization.missionStatement')?.clearValidators();

        // Add volunteer validators
        this.roleSpecificFormGroup.get('volunteer.bio')?.setValidators([Validators.required]);
        this.roleSpecificFormGroup.get('volunteer.emergencyContact.name')?.setValidators([Validators.required]);
        this.roleSpecificFormGroup.get('volunteer.emergencyContact.phone')?.setValidators([
          Validators.required,
          Validators.pattern(/^\+?[0-9\s\-\(\)]{8,20}$/)
        ]);
      }

      // Update validity for all fields
      this.updateFormValidity();
    });

    // If a role is already selected (e.g., from user data), trigger validation
    if (userRole) {
      this.onRoleChange(userRole);
    }
  }

  /**
   * Updates the validity of all form controls
   */
  updateFormValidity(): void {
    // Organization fields
    this.roleSpecificFormGroup.get('organization.name')?.updateValueAndValidity();
    this.roleSpecificFormGroup.get('organization.description')?.updateValueAndValidity();
    this.roleSpecificFormGroup.get('organization.organizationType')?.updateValueAndValidity();
    this.roleSpecificFormGroup.get('organization.missionStatement')?.updateValueAndValidity();

    // Volunteer fields
    this.roleSpecificFormGroup.get('volunteer.bio')?.updateValueAndValidity();
    this.roleSpecificFormGroup.get('volunteer.emergencyContact.name')?.updateValueAndValidity();
    this.roleSpecificFormGroup.get('volunteer.emergencyContact.phone')?.updateValueAndValidity();

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
    const selectedRole = role || this.roleFormGroup.get('role.type')?.value;
    console.log('Manual role change to:', selectedRole);

    if (selectedRole === 'ORGANIZATION') {
      // Add organization validators
      this.roleSpecificFormGroup.get('organization.name')?.setValidators([Validators.required]);
      this.roleSpecificFormGroup.get('organization.description')?.setValidators([Validators.required]);
      this.roleSpecificFormGroup.get('organization.organizationType')?.setValidators([Validators.required]);
      this.roleSpecificFormGroup.get('organization.missionStatement')?.setValidators([Validators.required]);

      // Clear volunteer validators
      this.roleSpecificFormGroup.get('volunteer.bio')?.clearValidators();
      this.roleSpecificFormGroup.get('volunteer.emergencyContact.name')?.clearValidators();
      this.roleSpecificFormGroup.get('volunteer.emergencyContact.phone')?.clearValidators();
    } else if (selectedRole === 'VOLUNTEER') {
      // Clear organization validators
      this.roleSpecificFormGroup.get('organization.name')?.clearValidators();
      this.roleSpecificFormGroup.get('organization.description')?.clearValidators();
      this.roleSpecificFormGroup.get('organization.organizationType')?.clearValidators();
      this.roleSpecificFormGroup.get('organization.missionStatement')?.clearValidators();

      // Add volunteer validators
      this.roleSpecificFormGroup.get('volunteer.bio')?.setValidators([Validators.required]);
      this.roleSpecificFormGroup.get('volunteer.emergencyContact.name')?.setValidators([Validators.required]);
      this.roleSpecificFormGroup.get('volunteer.emergencyContact.phone')?.setValidators([
        Validators.required,
        Validators.pattern(/^\+?[0-9\s\-\(\)]{8,20}$/)
      ]);
    }

    // Update validity for all fields
    this.updateFormValidity();
  }

  isOrganization(): boolean {
    return this.roleFormGroup.get('role.type')?.value === 'ORGANIZATION';
  }

  isVolunteer(): boolean {
    return this.roleFormGroup.get('role.type')?.value === 'VOLUNTEER';
  }

  // Chip input methods
  addSkill(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.skills.push(value);
    }
    event.chipInput!.clear();
  }

  removeSkill(skill: string): void {
    const index = this.skills.indexOf(skill);
    if (index >= 0) {
      this.skills.splice(index, 1);
    }
  }

  addInterest(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.interests.push(value);
    }
    event.chipInput!.clear();
  }

  removeInterest(interest: string): void {
    const index = this.interests.indexOf(interest);
    if (index >= 0) {
      this.interests.splice(index, 1);
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
    console.log('Submit button clicked');
    this.debugFormValidity();

    if (!this.validateForm()) {
      console.log('Form is invalid, showing errors');
      // Mark all form controls as touched to show validation errors
      this.markFormGroupTouched(this.roleFormGroup);
      this.markFormGroupTouched(this.contactFormGroup);
      this.markFormGroupTouched(this.roleSpecificFormGroup);

      // Identify which step has errors
      let errorStep = '';
      let missingFields: string[] = [];

      if (this.roleFormGroup.invalid) {
        errorStep = 'Role Selection';
        console.log('Role form errors:', this.getFormErrors(this.roleFormGroup));
        missingFields.push('role selection');
      } else if (this.contactFormGroup.invalid) {
        errorStep = 'Contact Information';
        console.log('Contact form errors:', this.getFormErrors(this.contactFormGroup));

        const contact = this.contactFormGroup.get('contact');
        if (!contact?.get('phoneNumber')?.valid) missingFields.push('phone number');
        if (!contact?.get('city')?.valid) missingFields.push('city');
        if (!contact?.get('province')?.valid) missingFields.push('province');
      } else if (this.roleSpecificFormGroup.invalid) {
        errorStep = 'Additional Information';
        console.log('Role-specific form errors:', this.getFormErrors(this.roleSpecificFormGroup));

        const roleType = this.roleFormGroup.get('role.type')?.value;
        if (roleType === 'VOLUNTEER') {
          const vol = this.roleSpecificFormGroup.get('volunteer');
          const emergency = vol?.get('emergencyContact');

          if (!vol?.get('bio')?.valid) missingFields.push('bio');
          if (!emergency?.get('name')?.valid) missingFields.push('emergency contact name');
          if (!emergency?.get('phone')?.valid) missingFields.push('emergency contact phone');
        } else if (roleType === 'ORGANIZATION') {
          const org = this.roleSpecificFormGroup.get('organization');

          if (!org?.get('name')?.valid) missingFields.push('organization name');
          if (!org?.get('description')?.valid) missingFields.push('organization description');
        }
      }

      let errorMessage = `Please fix the errors in the ${errorStep} section before submitting`;
      if (missingFields.length > 0) {
        errorMessage += `: Missing ${missingFields.join(', ')}`;
      }

      this.errorMessage = errorMessage;
      this.snackBar.open(errorMessage, 'Close', {
        duration: 7000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    console.log('Form is valid, submitting...');
    this.isSubmitting = true;
    this.errorMessage = '';

    // Prepare the form data
    const formData = this.prepareFormData();
    console.log('Form data prepared:', formData);

    // Dispatch the submitQuestionnaire action
    this.store.dispatch(AuthActions.submitQuestionnaire({ formData }));

    // Subscribe to the auth state to handle success/failure
    this.store.select(state => state).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe(state => {
      // This will be handled by the auth effects
    });
  }

  /**
   * Debug method to log the validity of all form controls
   */
  debugFormValidity(): void {
    console.log('--- Form Validity Debug ---');
    console.log('Main form valid:', this.questionnaireForm.valid);
    console.log('Role form valid:', this.roleFormGroup.valid);
    console.log('Contact form valid:', this.contactFormGroup.valid);
    console.log('Role-specific form valid:', this.roleSpecificFormGroup.valid);

    // Check role selection
    const roleType = this.roleFormGroup.get('role.type')?.value;
    console.log('Selected role:', roleType);

    // Check contact fields
    const contact = this.contactFormGroup.get('contact');
    console.log('Phone valid:', contact?.get('phoneNumber')?.valid, 'Value:', contact?.get('phoneNumber')?.value);
    console.log('City valid:', contact?.get('city')?.valid, 'Value:', contact?.get('city')?.value);
    console.log('Province valid:', contact?.get('province')?.valid, 'Value:', contact?.get('province')?.value);

    // Check role-specific fields based on role
    if (roleType === 'ORGANIZATION') {
      const org = this.roleSpecificFormGroup.get('organization');
      console.log('Org name valid:', org?.get('name')?.valid, 'Value:', org?.get('name')?.value);
      console.log('Org description valid:', org?.get('description')?.valid, 'Value:', org?.get('description')?.value);
      console.log('Org type valid:', org?.get('organizationType')?.valid, 'Value:', org?.get('organizationType')?.value);
      console.log('Mission statement valid:', org?.get('missionStatement')?.valid, 'Value:', org?.get('missionStatement')?.value);
    } else if (roleType === 'VOLUNTEER') {
      const vol = this.roleSpecificFormGroup.get('volunteer');
      console.log('Bio valid:', vol?.get('bio')?.valid, 'Value:', vol?.get('bio')?.value);

      const emergency = vol?.get('emergencyContact');
      console.log('Emergency name valid:', emergency?.get('name')?.valid, 'Value:', emergency?.get('name')?.value);
      console.log('Emergency phone valid:', emergency?.get('phone')?.valid, 'Value:', emergency?.get('phone')?.value);
    }

    console.log('--- End Form Validity Debug ---');
  }

  /**
   * Validates all form fields before submission
   * @returns boolean indicating if the form is valid
   */
  validateForm(): boolean {
    // Check if the role is selected
    const roleControl = this.roleFormGroup.get('role.type');
    if (!roleControl || !roleControl.value) {
      console.log('Role not selected');
      return false;
    }
    const roleType = roleControl.value;

    // Check if contact information is valid
    if (!this.isContactFormValid()) {
      console.log('Contact information invalid');
      return false;
    }

    // Check role-specific fields based on role
    if (roleType === 'ORGANIZATION') {
      const org = this.roleSpecificFormGroup.get('organization');
      if (!org) return false;

      const name = org.get('name');
      const description = org.get('description');

      if (!name || !description) return false;

      const nameValid = name.valid && !!name.value;
      const descValid = description.valid && !!description.value;

      if (!nameValid || !descValid) {
        console.log('Organization fields invalid:', { nameValid, descValid });
        return false;
      }

      return true;
    } else if (roleType === 'VOLUNTEER') {
      const vol = this.roleSpecificFormGroup.get('volunteer');
      if (!vol) return false;

      const emergency = vol.get('emergencyContact');
      if (!emergency) return false;

      const bio = vol.get('bio');
      const emergName = emergency.get('name');
      const emergPhone = emergency.get('phone');

      if (!bio || !emergName || !emergPhone) return false;

      const bioValid = bio.valid && !!bio.value;
      const emergNameValid = emergName.valid && !!emergName.value;
      const emergPhoneValid = emergPhone.valid && !!emergPhone.value;

      if (!bioValid || !emergNameValid || !emergPhoneValid) {
        console.log('Volunteer fields invalid:', { bioValid, emergNameValid, emergPhoneValid });
        return false;
      }

      return true;
    }

    return false;
  }

  /**
   * Gets a list of validation errors for a specific form group
   * @param formGroup The form group to check for errors
   * @returns Array of error messages
   */
  getFormErrors(formGroup: FormGroup): string[] {
    const errors: string[] = [];

    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        errors.push(...this.getFormErrors(control));
      } else if (control?.errors && control.touched) {
        Object.keys(control.errors).forEach(errorKey => {
          switch (errorKey) {
            case 'required':
              errors.push(`${key} is required`);
              break;
            case 'minlength':
              errors.push(`${key} must be at least ${control.errors?.['minlength'].requiredLength} characters`);
              break;
            case 'maxlength':
              errors.push(`${key} cannot exceed ${control.errors?.['maxlength'].requiredLength} characters`);
              break;
            case 'pattern':
              errors.push(`${key} has an invalid format`);
              break;
            default:
              errors.push(`${key} is invalid`);
          }
        });
      }
    });

    return errors;
  }

  private prepareFormData(): QuestionnaireRequest {
    const formValues = this.questionnaireForm.value;
    const requestData: QuestionnaireRequest = {
      role: formValues.role.type,
      phoneNumber: formValues.contact.phoneNumber,
      address: formValues.contact.address,
      city: formValues.contact.city,
      province: formValues.contact.province
    };

    // Add role-specific data
    if (this.isOrganization()) {
      requestData.organizationName = formValues.organization.name;
      requestData.website = formValues.organization.website;
      requestData.description = formValues.organization.description;
      requestData.organizationType = formValues.organization.organizationType;
      requestData.foundedYear = formValues.organization.foundedYear;
      requestData.missionStatement = formValues.organization.missionStatement;
      requestData.focusAreas = this.focusAreas;
      requestData.socialMediaLinks = {
        facebook: formValues.organization.socialMedia.facebook,
        twitter: formValues.organization.socialMedia.twitter,
        instagram: formValues.organization.socialMedia.instagram,
        linkedin: formValues.organization.socialMedia.linkedin
      };
    } else if (this.isVolunteer()) {
      requestData.bio = formValues.volunteer.bio;
      requestData.skills = this.skills;
      requestData.interests = this.interests;
      requestData.availability = formValues.volunteer.availability;
      requestData.education = formValues.volunteer.education;
      requestData.experience = formValues.volunteer.experience;
      requestData.preferredCauses = this.preferredCauses;
      requestData.languages = this.languages;
      requestData.drivingLicense = formValues.volunteer.drivingLicense;
      requestData.specialNeeds = formValues.volunteer.specialNeeds;
      requestData.emergencyContact = {
        name: formValues.volunteer.emergencyContact.name,
        relationship: formValues.volunteer.emergencyContact.relationship,
        phone: formValues.volunteer.emergencyContact.phone
      };
      requestData.statistics = {
        experienceYears: formValues.volunteer.statistics.experienceYears,
        hoursPerWeek: formValues.volunteer.statistics.hoursPerWeek,
        commitmentLength: formValues.volunteer.statistics.commitmentLength,
        maxTravelDistance: formValues.volunteer.statistics.maxTravelDistance
      };
    }

    return requestData;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Load cities when a province is selected
   */
  onProvinceChange(): void {
    const province = this.contactFormGroup.get('contact.province')?.value;
    if (province) {
      // Reset city value when province changes
      this.contactFormGroup.get('contact.city')?.setValue('');

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
      this.contactFormGroup.get('contact.city')?.setValue('');
    }
  }

  /**
   * Debug method to log city loading information
   */
  debugCityLoading(): void {
    console.log('--- City Loading Debug ---');
    const province = this.contactFormGroup.get('contact.province')?.value;
    console.log('Selected province:', province);
    console.log('Available cities:', this.citiesInProvince);
    console.log('Selected city:', this.contactFormGroup.get('contact.city')?.value);
    console.log('Contact form valid:', this.isContactFormValid());
    console.log('Contact form group valid:', this.contactFormGroup.valid);
    console.log('--- End City Loading Debug ---');

    // Show a snackbar with the debug info
    this.snackBar.open(`Province: ${province}, Cities: ${this.citiesInProvince.length}, Selected: ${this.contactFormGroup.get('contact.city')?.value || 'None'}, Form Valid: ${this.isContactFormValid()}`, 'Close', {
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
    return !!this.roleFormGroup.get('role.type')?.value;
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
}
