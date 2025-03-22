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
  isRegistering: boolean = false;
  isRegistered: boolean = false;
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
    this.loading = true;
    
    // Load event data
    this.eventService.getEventById(this.eventId!).pipe(
      tap(event => {
        this.event = event;
        
        // Check if the user is already registered for this event
        if (this.isUserLoggedIn) {
          const userId = this.authService.getCurrentUserId();
          // Check all possible ways to determine if user is registered
          const isRegistered = 
            event.isRegistered || 
            (event.registeredParticipants && event.registeredParticipants.includes(userId)) ||
            ((event as any).participations && Array.isArray((event as any).participations) && 
             (event as any).participations.some((p: any) => p.volunteerId === userId));
            
          if (isRegistered) {
            this.isRegistered = true;
            // We'll populate registration data if the user is already registered
            this.createRegistrationDataFromEvent(event);
            return;
          }
        }
        
        // If event is already full or registration is closed, redirect to event page
        if (event.currentParticipants >= event.maxParticipants && !event.waitlistEnabled) {
          this.snackBar.open('This event is already full', 'Close', { duration: 5000 });
          this.router.navigate(['/events', this.eventId]);
          return;
        }
        
        if (event.status === 'COMPLETED' || event.status === 'CANCELLED') {
          this.snackBar.open(`Registration is closed - event is ${event.status.toLowerCase()}`, 'Close', { duration: 5000 });
          this.router.navigate(['/events', this.eventId]);
          return;
        }
      }),
      switchMap(() => {
        // Load user data if logged in
        if (this.isUserLoggedIn) {
          const userId = this.authService.getCurrentUserId();
          if (userId) {
            return this.userService.getUserById(parseInt(userId)).pipe(
              tap(user => {
                this.currentUser = user;
                
                // Populate form with user data
                this.populateFormWithUserData(user);
                
                // If quick registration is requested and user data is available, submit immediately
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
                console.error('Error loading user data:', error);
                // If we can't get user data but quick registration was requested, show an error
                if (this.isQuickRegistration) {
                  this.snackBar.open('Failed to load your profile information for quick registration', 'Close', { 
                    duration: 5000,
                    panelClass: ['error-snackbar']
                  });
                  this.processingQuickRegistration = false;
                }
                return of(null);
              })
            );
          }
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
    // When not logged in, disable all fields
    const formState = this.isUserLoggedIn ? 'ENABLED' : 'DISABLED';
    
    return this.fb.group({
      firstName: [{value: '', disabled: true}, Validators.required],
      lastName: [{value: '', disabled: true}, Validators.required],
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]],
      phoneNumber: [{value: '', disabled: true}, [Validators.required, Validators.pattern(/^(?:\+212|0)[5-7]\d{8}$/)]],
      specialRequirements: [{value: '', disabled: !this.isUserLoggedIn}],
      notes: [{value: '', disabled: !this.isUserLoggedIn}],
      termsAccepted: [{value: false, disabled: !this.isUserLoggedIn}, Validators.requiredTrue]
    });
  }
  
  private populateFormWithUserData(user: User): void {
    if (user) {
      // Only populate form if user is logged in
      if (this.isUserLoggedIn) {
        this.registrationForm.patchValue({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          // Auto-accept terms for quick registration
          termsAccepted: this.isQuickRegistration
        });
        
        // Make sure the user info fields show as readonly but contain data
        this.registrationForm.get('firstName')?.enable();
        this.registrationForm.get('lastName')?.enable();
        this.registrationForm.get('email')?.enable();
        this.registrationForm.get('phoneNumber')?.enable();
        
        // Then disable them again to make them readonly
        this.registrationForm.get('firstName')?.disable();
        this.registrationForm.get('lastName')?.disable();
        this.registrationForm.get('email')?.disable();
        this.registrationForm.get('phoneNumber')?.disable();
      }
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
    const controls = this.registrationForm.controls;
    return Boolean(
      controls['firstName'].value &&
      controls['lastName'].value &&
      controls['email'].value &&
      controls['phoneNumber'].value
    );
  }
  
  // Perform quick registration directly with user data
  private performQuickRegistration(user: User): void {
    if (!this.event || !this.eventId) {
      this.processingQuickRegistration = false;
      this.error = 'Event information missing. Please try again.';
      return;
    }
    
    this.isRegistering = true;
    
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
        this.isRegistering = false;
      })
    ).subscribe();
  }
  
  submitRegistration(): void {
    if (this.registrationForm.invalid) {
      this.markAllAsTouched();
      return;
    }
    
    if (!this.event || !this.eventId) {
      this.error = 'Event information missing. Please try again.';
      return;
    }
    
    this.isRegistering = true;
    
    // Get values from the form, including both disabled (readonly) fields
    const formValues = {
      ...this.registrationForm.getRawValue(),
      eventId: this.eventId
    };
    
    const registrationData: IEventRegistrationRequest = formValues;
    
    this.eventService.registerWithDetails(this.eventId, registrationData).pipe(
      tap(() => {
        this.isRegistered = true;
        this.registrationSuccess = true;
        this.registrationData = registrationData as ExtendedRegistrationData;
        
        const message = this.event?.requiresApproval
          ? 'Registration submitted! Awaiting approval from the organizer.'
          : 'Registration successful! You are now registered for this event.';
          
        this.snackBar.open(message, 'Close', { 
          duration: 5000,
          panelClass: ['success-snackbar']
        });
      }),
      catchError(error => {
        console.error('Error registering for event:', error);
        
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
          error.message || 'Failed to register for the event. Please try again.',
          'Close',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
        return of(null);
      }),
      finalize(() => {
        this.isRegistering = false;
      })
    ).subscribe();
  }
  
  // Convenience method for quick registration button from the template
  quickRegister(): void {
    if (this.isUserLoggedIn && this.currentUser) {
      if (this.validateUserDataForQuickRegistration(this.currentUser)) {
        this.performQuickRegistration(this.currentUser);
      } else {
        this.snackBar.open('Your profile information is incomplete. Please complete the form below.', 'Close', { 
          duration: 5000
        });
      }
    } else {
      this.snackBar.open('Please log in to use quick registration', 'Close', { 
        duration: 5000
      });
      // Redirect to login page with redirect back to this page
      this.router.navigate(['/auth/login'], { 
        queryParams: { redirectUrl: `/events/${this.eventId}/register?quick=true` } 
      });
    }
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
} 