import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../../core/services/auth.service';
import { EventService } from '../../../../core/services/event.service';
import { UserService } from '../../../../core/services/user.service';
import { VolunteerService } from '../../../../core/services/volunteer.service';
import { IEvent, IEventRegistration, IEventRegistrationRequest } from '../../../../core/models/event.types';
import { User } from '../../../../core/models/auth.models';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';

// Define an extended interface that includes status
interface ExtendedRegistrationData extends IEventRegistrationRequest {
  status?: string;
}

@Component({
  selector: 'app-event-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './event-registration.component.html',
  styleUrls: ['./event-registration.component.scss']
})
export class EventRegistrationComponent implements OnInit {
  eventId: string | null = null;
  event: IEvent | null = null;
  loading: boolean = true;
  isSubmitting: boolean = false;
  isRegistered: boolean = false;
  isRegistering: boolean = false;
  registrationSuccess: boolean = false;
  error: string | null = null;
  isUserLoggedIn: boolean = false;
  currentUser: User | null = null;
  registrationForm: FormGroup;
  registrationData: ExtendedRegistrationData | null = null;
  isQuickRegistration: boolean = false;
  processingQuickRegistration: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private eventService: EventService,
    private authService: AuthService,
    private userService: UserService,
    private volunteerService: VolunteerService,
    private snackBar: MatSnackBar
  ) {
    this.registrationForm = this.createRegistrationForm();
  }

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id');
    this.isUserLoggedIn = this.authService.isLoggedIn();
    
    // Re-create the form now that we know the login status
    this.registrationForm = this.createRegistrationForm();
    
    // Check for quick registration parameter
    this.isQuickRegistration = this.route.snapshot.queryParams['quick'] === 'true';
    
    if (!this.eventId) {
      this.error = 'Event ID not found.';
      this.loading = false;
      return;
    }
    
    this.loadEventAndUserData();
  }

  private loadEventAndUserData(): void {
    if (!this.eventId) {
      this.error = 'Event ID not found.';
      this.loading = false;
      return;
    }

    this.eventService.getEventById(this.eventId).pipe(
      tap(event => {
        console.log('Event data loaded:', event);
        this.event = event;
        
        // Check if the user is already registered
        if (event.isRegistered) {
            this.isRegistered = true;
          this.registrationSuccess = true;
            this.createRegistrationDataFromEvent(event);
        }
      }),
      switchMap(event => {
        if (this.isUserLoggedIn) {
          console.log('Decoded token:', this.authService.getDecodedToken());
          
          // Directly use getCurrentUserProfile instead of getUserById
          return this.userService.getCurrentUserProfile().pipe(
              tap(user => {
              console.log('User profile loaded successfully:', user);
                this.currentUser = user;
                
                // Populate form with user data
                this.populateFormWithUserData(user);
                
              // Handle quick registration if needed
                if (this.isQuickRegistration && this.currentUser && !this.isRegistered) {
                  this.processingQuickRegistration = true;
                  if (this.validateUserDataForQuickRegistration(user)) {
                    // Directly submit with user data instead of just populating the form
                    this.performQuickRegistration(user);
                  } else {
                    // If user data is incomplete, show a message and let them fill the form
                    this.processingQuickRegistration = false;
                    this.snackBar.open('Your profile information is incomplete. Please fill in the required details.', 'Close', {
                      duration: 5000
                    });
                  }
                }
              }),
              catchError(error => {
              console.error('Error loading user profile:', error);
              // Create dummy user with information from auth token
              const token = this.authService.getDecodedToken();
              if (token && token.sub) {
                const partialUser = {
                  id: token.user_id || this.authService.getCurrentUserId(),
                  email: token.sub,
                  firstName: token.first_name || '',
                  lastName: token.last_name || '',
                  phoneNumber: '',
                  roles: token.role ? [token.role.replace('ROLE_', '')] : []
                } as User;
                
                this.currentUser = partialUser;
                this.populateFormWithUserData(partialUser);
                
                // Show warning but still allow registration
                this.snackBar.open('Could not load your complete profile. Some fields may need to be filled manually.', 'Close', { 
                  duration: 5000,
                  panelClass: ['warning-snackbar']
                });
              } else {
                // If we can't get any user data at all
                if (this.isQuickRegistration) {
                  this.snackBar.open('Failed to load your profile information for quick registration', 'Close', { 
                    duration: 5000,
                    panelClass: ['error-snackbar']
                  });
                  this.processingQuickRegistration = false;
                }
                }
                return of(null);
              })
            );
        } else if (this.isQuickRegistration) {
          // User is not logged in but quick registration was requested
          this.snackBar.open('Please log in to use quick registration', 'Close', { duration: 5000 });
          this.router.navigate(['/auth/login'], { 
            queryParams: { redirectUrl: `/events/${this.eventId}/register?quick=true` } 
          });
        }
        return of(null);
      }),
      catchError(error => {
        console.error('Error loading event:', error);
        this.error = 'Failed to load event details. Please try again later.';
        this.processingQuickRegistration = false;
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe();
  }

  private createRegistrationForm(): FormGroup {
    return this.fb.group({
      firstName: [{value: '', disabled: true}, Validators.required],
      lastName: [{value: '', disabled: true}, Validators.required],
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]],
      phoneNumber: [{value: '', disabled: true}, [Validators.required, Validators.pattern(/^(?:\+212|0)[5-7]\d{8}$/)]],
      specialRequirements: [''],
      notes: [''],
      termsAccepted: [false, Validators.requiredTrue]
    });
  }
  
  private populateFormWithUserData(user: User): void {
    if (user && this.isUserLoggedIn) {
      // Use patchValue to update form values without affecting the disabled state
        this.registrationForm.patchValue({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          // Auto-accept terms for quick registration
          termsAccepted: this.isQuickRegistration
        });
        
      // Keep the contact info fields disabled (readonly)
        this.registrationForm.get('firstName')?.disable();
        this.registrationForm.get('lastName')?.disable();
        this.registrationForm.get('email')?.disable();
        this.registrationForm.get('phoneNumber')?.disable();
      
      // Log the form state for debugging
      console.log('Form after populating user data:', {
        formValues: this.registrationForm.getRawValue(),
        firstName: {
          value: this.registrationForm.get('firstName')?.value,
          disabled: this.registrationForm.get('firstName')?.disabled
        }
      });
    }
  }
  
  // Validate if the user data is complete enough for quick registration
  private validateUserDataForQuickRegistration(user: User): boolean {
    return Boolean(
      user.firstName && 
      user.lastName && 
      user.email && 
      user.phoneNumber
    );
  }
  
  // Validate if the form is complete enough for quick registration
  private validateQuickRegistration(): boolean {
    if (!this.isUserLoggedIn) {
      this.navigateToLogin();
      return false;
    }
    
    if (!this.event) {
      this.snackBar.open('Unable to load event details', 'Close', { duration: 3000 });
      return false;
    }
    
    if (this.event && this.event.currentParticipants >= this.event.maxParticipants && 
        !this.event.waitlistEnabled) {
      this.snackBar.open('This event is full and does not have a waitlist', 'Close', { duration: 3000 });
      return false;
    }
    
    return true;
  }
  
  // Perform quick registration directly with user data
  private performQuickRegistration(user: User): void {
    if (!this.event || !this.eventId) {
      this.processingQuickRegistration = false;
      this.error = 'Event information missing. Please try again.';
      return;
    }
    
    this.isSubmitting = true;
    
    const registrationData: IEventRegistrationRequest = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      specialRequirements: '',
      notes: '',
      termsAccepted: true,
      eventId: this.eventId
    };
    
    this.eventService.registerWithDetails(this.eventId, registrationData).pipe(
      tap(() => {
        this.isRegistered = true;
        this.registrationSuccess = true;
        this.registrationData = registrationData as ExtendedRegistrationData;
        
        const message = this.event?.requiresApproval
          ? 'Quick registration successful! Your registration is awaiting approval from the organizer.'
          : 'Quick registration successful! You are now registered for this event.';
          
        this.snackBar.open(message, 'Close', { 
          duration: 5000,
          panelClass: ['success-snackbar']
        });
      }),
      catchError(error => {
        console.error('Error during quick registration:', error);
        this.processingQuickRegistration = false;
        
        // Handle "already registered" error
        if (error.message && error.message.includes('already registered')) {
          this.isRegistered = true;
          this.registrationSuccess = true;
          this.registrationData = registrationData as ExtendedRegistrationData;
          this.createRegistrationDataFromEvent(this.event!);
          this.snackBar.open('You are already registered for this event.', 'Close', { 
            duration: 5000,
            panelClass: ['info-snackbar']
          });
          return of(null);
        }
        
        this.snackBar.open(
          error.message || 'Quick registration failed. Please try standard registration.',
          'Close',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
        return of(null);
      }),
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe();
  }
  
  registerForEvent(): void {
    if (!this.isUserLoggedIn) {
      // Redirect to login with return URL
      this.navigateToLogin();
      return;
    }

    // Check if the user is a volunteer with approved status
    if (this.currentUser) {
      this.volunteerService.getVolunteerProfile().subscribe({
        next: (volunteerProfile) => {
          if (volunteerProfile.approvalStatus !== 'APPROVED') {
            this.snackBar.open(
              'Your volunteer profile is not approved yet. Please wait for admin approval before registering for events.',
              'Close',
              { duration: 5000, panelClass: ['warning-snackbar'] }
            );
            return;
          } else if (volunteerProfile.banned) {
            this.snackBar.open(
              'Your account has been banned. You cannot register for events.',
              'Close',
              { duration: 5000, panelClass: ['error-snackbar'] }
            );
            return;
          }
          
          // If the volunteer is approved, proceed with registration
          this.proceedWithRegistration();
        },
        error: (error) => {
          console.error('Error checking volunteer status:', error);
          this.snackBar.open(
            'Could not verify your volunteer status. Please try again later.',
            'Close',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
        }
      });
    }
  }

  // Contains the original registration logic
  private proceedWithRegistration(): void {
    if (this.isRegistered) {
      this.snackBar.open('You are already registered for this event', 'Close', { duration: 3000 });
      return;
    }
    
    if (!this.event) {
      this.snackBar.open('Event details not found', 'Close', { duration: 3000 });
      return;
    }
    
    // Check if event is active
    if (this.event.status !== 'ACTIVE' && this.event.status !== 'PUBLISHED' && this.event.status !== 'UPCOMING') {
      this.snackBar.open(`Cannot register - event status is ${this.event.status}`, 'Close', { duration: 3000 });
      return;
    }
    
    // Check if event is already full
    if (this.event.currentParticipants >= this.event.maxParticipants && !this.event.waitlistEnabled) {
      this.snackBar.open('This event is full and does not have a waitlist', 'Close', { duration: 3000 });
      return;
    }
    
    if (!this.registrationForm.valid) {
      this.markAllAsTouched();
      this.snackBar.open('Please complete all required fields', 'Close', { duration: 3000 });
      return;
    }
    
    this.isSubmitting = true;
    
    // Get raw form values including disabled fields
    const formValues = this.registrationForm.getRawValue();
    
    // Create a safely typed token object with default empty values
    const token = this.authService.getDecodedToken();
    const userId = this.authService.getCurrentUserId();
    
    console.log('Using userId for registration:', userId);
    console.log('Token info:', {
      user_id: token?.user_id || 'not available',
      sub: token?.sub || 'not available'
    });
    
    // Prepare registration data, ensuring userId is included
    const registrationData: IEventRegistrationRequest = {
      ...formValues,
      userId: userId,
      email: formValues.email || (token?.sub as string) || '',
      eventId: this.eventId!
    };
    
    console.log('Submitting registration data:', registrationData);
    
    // Ensure we have at least an email
    if (!registrationData.email && token?.sub) {
      registrationData.email = token.sub as string;
    }
    
    this.eventService.registerWithDetails(this.eventId!, registrationData)
      .subscribe({
        next: (response: any) => {
        console.log('Registration successful:', response);
        this.isRegistered = true;
        this.registrationSuccess = true;
        
        // Set registration data with status if available
        this.registrationData = {
          ...registrationData,
          status: response.status || (this.event?.requiresApproval ? 'PENDING' : 'APPROVED')
        };
        
        this.snackBar.open('Registration successful!', 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
        error: (error: any) => {
        console.error('Error registering for event:', error);
          this.handleRegistrationError(error, registrationData);
      },
      complete: () => {
          this.isSubmitting = false;
      }
    });
  }

  submitRegistration(): void {
    if (!this.isUserLoggedIn) {
      this.navigateToLogin();
      return;
    }
    
    if (this.registrationForm.invalid) {
      this.markAllAsTouched();
      this.snackBar.open('Please complete all required fields', 'Close', { duration: 3000 });
      return;
    }
    
    this.isSubmitting = true;
    
    // Get raw form values including disabled fields
    const formValues = this.registrationForm.getRawValue();
    
    // Create a safely typed token object with default empty values
    const token = this.authService.getDecodedToken();
    const userId = this.authService.getCurrentUserId();
    
    console.log('Using userId for registration:', userId);
    console.log('Token info:', {
      user_id: token?.user_id || 'not available',
      sub: token?.sub || 'not available'
    });
    
    // Prepare registration data, ensuring userId is included
    const registrationData: IEventRegistrationRequest = {
      ...formValues,
      userId: userId,
      email: formValues.email || (token?.sub as string) || '',
      eventId: this.eventId!
    };
    
    console.log('Submitting registration data:', registrationData);
    
    // Ensure we have at least an email
    if (!registrationData.email && token?.sub) {
      registrationData.email = token.sub as string;
    }
    
    this.eventService.registerWithDetails(this.eventId!, registrationData)
      .subscribe({
        next: (response: any) => {
          console.log('Registration successful:', response);
          this.isRegistered = true;
          this.registrationSuccess = true;
          
          // Set registration data with status if available
          this.registrationData = {
            ...registrationData,
            status: response.status || (this.event?.requiresApproval ? 'PENDING' : 'APPROVED')
          };
          
          this.snackBar.open('Registration successful!', 'Close', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error: any) => {
          console.error('Error registering for event:', error);
          this.handleRegistrationError(error, registrationData);
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
  }

  private markAllAsTouched(): void {
    Object.keys(this.registrationForm.controls).forEach(key => {
      const control = this.registrationForm.get(key);
      control?.markAsTouched();
    });
  }

  // Create registration data from event if user is already registered
  private createRegistrationDataFromEvent(event: IEvent): void {
    if (this.currentUser) {
      this.registrationData = {
        firstName: this.currentUser.firstName || '',
        lastName: this.currentUser.lastName || '',
        email: this.currentUser.email || '',
        phoneNumber: this.currentUser.phoneNumber || '',
        specialRequirements: '',
        notes: '',
        termsAccepted: true,
        eventId: this.eventId || '',
        status: event.status
      };
    }
    
    // Find the user's participation details if available in event data
    if (event && this.isUserLoggedIn) {
      const userId = this.authService.getCurrentUserId();
      
      // Check if we have participation information
      const participations = (event as any).participations;
      if (participations && Array.isArray(participations)) {
        const participation = participations.find((p: any) => p.volunteerId === userId);
        if (participation) {
          // Only update the fields that exist in our registrationData
          if (this.registrationData) {
            this.registrationData.specialRequirements = participation.specialRequirements || '';
            this.registrationData.notes = participation.notes || '';
            this.registrationData.status = event.status;
          }
        }
      }
    }
  }

  // Navigate to login page with redirect back to registration
  navigateToLogin(): void {
    this.router.navigate(['/auth/login'], { 
      queryParams: { redirectUrl: `/events/${this.eventId}/register` } 
    });
  }

  // Quick registration method that validates and then calls for quick registration
  quickRegister(): void {
    if (!this.validateQuickRegistration()) {
      return;
    }
    this.registerForQuickEvent();
  }

  // Method specifically for quick registration with minimal data
  private registerForQuickEvent(): void {
    this.isSubmitting = true;
    
    const userId = this.authService.getCurrentUserId();
    
    // Create minimal registration data
    const registrationData: IEventRegistrationRequest = {
      firstName: this.currentUser?.firstName || '',
      lastName: this.currentUser?.lastName || '',
      email: this.currentUser?.email || '',
      phoneNumber: this.currentUser?.phoneNumber || '',
      termsAccepted: true,
      userId: userId,
      eventId: this.eventId!
    };
    
    console.log('Quick registering with data:', registrationData);
    
    // Use the same method as the normal registration
    this.eventService.registerWithDetails(this.eventId!, registrationData)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log('Quick registration successful:', response);
          this.isRegistered = true;
          this.registrationSuccess = true;
          
          this.registrationData = {
            ...registrationData,
            status: response.status || (this.event?.requiresApproval ? 'PENDING' : 'APPROVED')
          };
          
          this.snackBar.open('Registration successful!', 'Close', { 
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          
          // Remove navigation to allow user to see success UI
          // this.router.navigate(['/events', this.eventId]);
        },
        error: (error) => {
          console.error('Quick registration error', error);
          this.handleRegistrationError(error, registrationData);
        }
      });
  }

  private handleRegistrationError(error: any, registrationData: IEventRegistrationRequest): void {
    let errorMessage = 'Failed to register for the event. Please try again.';
    
    if (error.status === 409) {
      errorMessage = 'You are already registered for this event.';
      this.isRegistered = true; // Mark as registered despite the error
      
      // Try to load the existing registration data
      if (this.eventId && this.authService.getCurrentUserId()) {
        this.eventService.checkRegistrationStatus(this.eventId, this.authService.getCurrentUserId())
          .subscribe((response: { isRegistered: boolean; status: string }) => {
            if (response.isRegistered) {
              this.registrationData = {
                firstName: this.currentUser?.firstName || '',
                lastName: this.currentUser?.lastName || '',
                email: this.currentUser?.email || '',
                phoneNumber: this.currentUser?.phoneNumber || '',
                termsAccepted: true,
                status: response.status
              };
              this.registrationSuccess = true;
            }
          });
      }
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to register for this event.';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Invalid registration data.';
    }
    
    this.snackBar.open(errorMessage, 'Close', { 
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /** Submits the registration form data */
  onSubmit(): void {
    console.log('Form submission attempted');
    
    // Ensure the user is logged in
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Please log in to register for this event', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/auth/login'], { 
        queryParams: { 
          returnUrl: this.router.url,
          message: 'Please log in to register for this event'
        } 
      });
      return;
    }
    
    // Validate form
    if (this.registrationForm.invalid) {
      this.markAllAsTouched();
      this.snackBar.open('Please complete all required fields', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    // Check if event is full without waitlist
    if (this.event && this.event.currentParticipants >= this.event.maxParticipants && 
       !this.event.waitlistEnabled) {
      this.snackBar.open('This event is full and does not have a waitlist', 'Close', { duration: 3000 });
      return;
    }
    
    this.isSubmitting = true;
    
    // Get raw form values including disabled fields
    const formValues = this.registrationForm.getRawValue();
    
    // Create a safely typed token object with default empty values
    const token = this.authService.getDecodedToken();
    const userId = this.authService.getCurrentUserId();
    
    console.log('Using userId for registration:', userId);
    console.log('Token info:', {
      user_id: token?.user_id || 'not available',
      sub: token?.sub || 'not available'
    });
    
    // Prepare registration data, ensuring userId is included
    const registrationData: IEventRegistrationRequest = {
      ...formValues,
      userId: userId,
      email: formValues.email || (token?.sub as string) || '',
      eventId: this.eventId!
    };
    
    console.log('Submitting registration data:', registrationData);
    
    // Ensure we have at least an email
    if (!registrationData.email && token?.sub) {
      registrationData.email = token.sub as string;
    }
    
    this.eventService.registerWithDetails(this.eventId!, registrationData)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log('Registration successful:', response);
          this.isRegistered = true;
          this.registrationSuccess = true;
          
          // Set registration data with status if available
          this.registrationData = {
            ...registrationData,
            status: response.status || (this.event?.requiresApproval ? 'PENDING' : 'APPROVED')
          };
          
          this.snackBar.open('Registration successful!', 'Close', { 
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          
          // Navigate to event details page
          this.router.navigate(['/events', this.eventId]);
        },
        error: (error) => {
          console.error('Registration error', error);
          this.handleRegistrationError(error, registrationData);
        }
      });
  }
} 