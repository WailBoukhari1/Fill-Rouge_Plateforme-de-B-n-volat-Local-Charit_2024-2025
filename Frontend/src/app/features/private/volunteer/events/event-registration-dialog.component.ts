import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { IEvent } from '../../../../core/models/event.types';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/auth.models';

@Component({
  selector: 'app-event-registration-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule
  ],
  template: `
    <h2 mat-dialog-title>Register for Event: {{ data.event.title }}</h2>
    
    <mat-dialog-content>
      <mat-tab-group>
        <mat-tab label="Quick Registration">
          <mat-card class="p-4 my-3">
            <mat-card-content>
              <p class="mb-4 text-amber-600 font-medium">
                If you choose Quick Registration, you will be registered with your current profile information directly. 
                No additional information or requirements will be provided.
              </p>
              
              <div *ngIf="isEventFull()" class="mb-4 bg-yellow-50 p-3 border border-yellow-200 rounded">
                <p class="text-yellow-700">
                  <mat-icon class="align-middle mr-2">info</mat-icon>
                  This event is currently full. By registering, you will be placed on the waitlist.
                </p>
              </div>
              
              <div *ngIf="!isEventFull() && data.event.requiresApproval" class="mb-4 bg-blue-50 p-3 border border-blue-200 rounded">
                <p class="text-blue-700">
                  <mat-icon class="align-middle mr-2">info</mat-icon>
                  This event requires approval. After registration, you will be placed on the waitlist until approved.
                </p>
              </div>
              
              <div *ngIf="currentUser" class="mb-4">
                <h3 class="font-medium mb-2">Your information</h3>
                <p><strong>Name:</strong> {{ currentUser.firstName }} {{ currentUser.lastName }}</p>
                <p><strong>Email:</strong> {{ currentUser.email }}</p>
                <p><strong>Phone:</strong> {{ getPhoneNumber() }}</p>
              </div>
            </mat-card-content>
            <mat-card-actions align="end">
              <button mat-raised-button color="primary" (click)="quickRegister()">
                Register Now
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-tab>
        
        <mat-tab label="Standard Registration">
          <form [formGroup]="registrationForm" class="p-4">
            <p class="mb-4 text-blue-600 font-medium">
              Standard Registration allows you to add special requirements or leave a note for the event organizers.
            </p>
            
            <div *ngIf="isEventFull()" class="mb-4 bg-yellow-50 p-3 border border-yellow-200 rounded">
              <p class="text-yellow-700">
                <mat-icon class="align-middle mr-2">info</mat-icon>
                This event is currently full. By registering, you will be placed on the waitlist.
              </p>
            </div>
            
            <div *ngIf="!isEventFull() && data.event.requiresApproval" class="mb-4 bg-blue-50 p-3 border border-blue-200 rounded">
              <p class="text-blue-700">
                <mat-icon class="align-middle mr-2">info</mat-icon>
                This event requires approval. After registration, you will be placed on the waitlist until approved.
              </p>
            </div>
            
            <div *ngIf="currentUser" class="mb-4">
              <h3 class="font-medium mb-2">Your information (cannot be modified)</h3>
              <p><strong>Name:</strong> {{ currentUser.firstName }} {{ currentUser.lastName }}</p>
              <p><strong>Email:</strong> {{ currentUser.email }}</p>
              <p><strong>Phone:</strong> {{ getPhoneNumber() }}</p>
            </div>
            
            <mat-form-field appearance="outline" class="w-full mb-3">
              <mat-label>Special Requirements</mat-label>
              <textarea matInput formControlName="specialRequirements" rows="3" 
                placeholder="Dietary restrictions, accessibility needs, etc."></textarea>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Note to Organizers</mat-label>
              <textarea matInput formControlName="notes" rows="3" 
                placeholder="Any additional information you'd like the organizers to know"></textarea>
            </mat-form-field>
          </form>
          
          <div class="flex justify-end p-4">
            <button mat-raised-button color="primary" 
                    [disabled]="registrationForm.invalid"
                    (click)="standardRegister()">
              Submit Registration
            </button>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
    </mat-dialog-actions>
  `
})
export class EventRegistrationDialogComponent implements OnInit {
  registrationForm: FormGroup;
  currentUser: User | null = null;
  private userId: string = '';

  constructor(
    private dialogRef: MatDialogRef<EventRegistrationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { event: IEvent },
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.registrationForm = this.fb.group({
      specialRequirements: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.userId = this.authService.getCurrentUserId();
    if (this.userId) {
      this.userService.getUserById(parseInt(this.userId)).subscribe(
        (user: User) => {
          this.currentUser = user;
        },
        (error: Error) => {
          console.error('Error loading user data:', error);
        }
      );
    }
  }

  isEventFull(): boolean {
    return (this.data.event.registeredParticipants?.length || 0) >= this.data.event.maxParticipants;
  }

  quickRegister(): void {
    this.dialogRef.close({ 
      type: 'quick',
      eventId: this.data.event._id 
    });
  }

  standardRegister(): void {
    if (this.registrationForm.valid) {
      this.dialogRef.close({
        type: 'standard',
        eventId: this.data.event._id,
        data: this.registrationForm.value
      });
    }
  }

  getPhoneNumber(): string {
    // Since phone might not be directly in the User model, 
    // we can retrieve it from profile data or return a default message
    return 'Please update your profile to add a phone number';
  }
} 