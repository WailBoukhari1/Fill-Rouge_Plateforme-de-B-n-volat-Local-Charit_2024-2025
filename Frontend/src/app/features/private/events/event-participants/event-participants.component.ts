import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-event-participants',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatCardModule
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Event Participants</h1>
          <p class="text-gray-600">Manage event registrations and attendance</p>
        </div>
        <div class="space-x-4">
          <button mat-raised-button color="primary">
            <mat-icon class="mr-2">download</mat-icon>
            Export List
          </button>
          <button mat-raised-button color="accent">
            <mat-icon class="mr-2">email</mat-icon>
            Message All
          </button>
        </div>
      </div>

      <!-- Event Info -->
      <mat-card class="mb-8">
        <mat-card-content class="p-6">
          <div class="flex items-start">
            <img [src]="event.imageUrl" [alt]="event.title" 
                 class="w-24 h-24 rounded object-cover mr-6">
            <div>
              <h2 class="text-2xl font-bold mb-2">{{event.title}}</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="flex items-center">
                  <mat-icon class="text-gray-400 mr-2">event</mat-icon>
                  <span>{{event.startDate | date:'medium'}}</span>
                </div>
                <div class="flex items-center">
                  <mat-icon class="text-gray-400 mr-2">location_on</mat-icon>
                  <span>{{event.location}}</span>
                </div>
                <div class="flex items-center">
                  <mat-icon class="text-gray-400 mr-2">group</mat-icon>
                  <span>{{event.registeredParticipants}}/{{event.maxParticipants}} registered</span>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Participants Tabs -->
      <mat-card>
        <mat-card-content>
          <mat-tab-group>
            <!-- Registered Participants -->
            <mat-tab label="Registered ({{registeredParticipants.length}})">
              <div class="p-6">
                @if (isLoading) {
                  <div class="flex justify-center py-12">
                    <mat-spinner diameter="40"></mat-spinner>
                  </div>
                } @else {
                  <table mat-table [dataSource]="registeredParticipants" class="w-full">
                    <!-- Participant Column -->
                    <ng-container matColumnDef="participant">
                      <th mat-header-cell *matHeaderCellDef>Participant</th>
                      <td mat-cell *matCellDef="let participant">
                        <div class="flex items-center">
                          <mat-icon class="text-gray-400 mr-3">account_circle</mat-icon>
                          <div>
                            <p class="font-medium">{{participant.name}}</p>
                            <p class="text-sm text-gray-600">{{participant.email}}</p>
                          </div>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Registration Date Column -->
                    <ng-container matColumnDef="registrationDate">
                      <th mat-header-cell *matHeaderCellDef>Registration Date</th>
                      <td mat-cell *matCellDef="let participant">
                        {{participant.registrationDate | date}}
                      </td>
                    </ng-container>

                    <!-- Status Column -->
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let participant">
                        <mat-chip [color]="getStatusColor(participant.status)">
                          {{participant.status}}
                        </mat-chip>
                      </td>
                    </ng-container>

                    <!-- Check-in Column -->
                    <ng-container matColumnDef="checkin">
                      <th mat-header-cell *matHeaderCellDef>Check-in</th>
                      <td mat-cell *matCellDef="let participant">
                        @if (participant.checkedIn) {
                          <div class="text-sm text-gray-600">
                            Checked in at {{participant.checkInTime | date:'shortTime'}}
                          </div>
                        } @else {
                          <button mat-button color="primary" (click)="checkIn(participant)">
                            <mat-icon class="mr-2">how_to_reg</mat-icon>
                            Check In
                          </button>
                        }
                      </td>
                    </ng-container>

                    <!-- Actions Column -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef></th>
                      <td mat-cell *matCellDef="let participant">
                        <button mat-icon-button [matMenuTriggerFor]="menu">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                        <mat-menu #menu="matMenu">
                          <button mat-menu-item (click)="viewProfile(participant)">
                            <mat-icon>person</mat-icon>
                            <span>View Profile</span>
                          </button>
                          <button mat-menu-item (click)="sendMessage(participant)">
                            <mat-icon>email</mat-icon>
                            <span>Send Message</span>
                          </button>
                          <button mat-menu-item class="text-red-500" (click)="removeParticipant(participant)">
                            <mat-icon>remove_circle</mat-icon>
                            <span>Remove</span>
                          </button>
                        </mat-menu>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                  </table>

                  <mat-paginator
                    [length]="totalParticipants"
                    [pageSize]="pageSize"
                    [pageSizeOptions]="[5, 10, 25, 100]"
                    (page)="onPageChange($event)"
                    aria-label="Select page">
                  </mat-paginator>
                }
              </div>
            </mat-tab>

            <!-- Waitlist -->
            <mat-tab label="Waitlist ({{waitlistedParticipants.length}})">
              <div class="p-6">
                @if (waitlistedParticipants.length === 0) {
                  <p class="text-center text-gray-600 py-8">No participants on the waitlist</p>
                } @else {
                  <table mat-table [dataSource]="waitlistedParticipants" class="w-full">
                    <!-- Participant Column -->
                    <ng-container matColumnDef="participant">
                      <th mat-header-cell *matHeaderCellDef>Participant</th>
                      <td mat-cell *matCellDef="let participant">
                        <div class="flex items-center">
                          <mat-icon class="text-gray-400 mr-3">account_circle</mat-icon>
                          <div>
                            <p class="font-medium">{{participant.name}}</p>
                            <p class="text-sm text-gray-600">{{participant.email}}</p>
                          </div>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Position Column -->
                    <ng-container matColumnDef="position">
                      <th mat-header-cell *matHeaderCellDef>Position</th>
                      <td mat-cell *matCellDef="let participant">
                        #{{participant.waitlistPosition}}
                      </td>
                    </ng-container>

                    <!-- Join Date Column -->
                    <ng-container matColumnDef="joinDate">
                      <th mat-header-cell *matHeaderCellDef>Joined Waitlist</th>
                      <td mat-cell *matCellDef="let participant">
                        {{participant.joinDate | date}}
                      </td>
                    </ng-container>

                    <!-- Actions Column -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef></th>
                      <td mat-cell *matCellDef="let participant">
                        <button mat-button color="primary" (click)="promoteFromWaitlist(participant)">
                          <mat-icon class="mr-2">upgrade</mat-icon>
                          Promote
                        </button>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="waitlistColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: waitlistColumns;"></tr>
                  </table>
                }
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class EventParticipantsComponent implements OnInit {
  event: any = {};
  isLoading = true;
  displayedColumns: string[] = ['participant', 'registrationDate', 'status', 'checkin', 'actions'];
  waitlistColumns: string[] = ['participant', 'position', 'joinDate', 'actions'];
  registeredParticipants: any[] = [];
  waitlistedParticipants: any[] = [];
  totalParticipants = 0;
  pageSize = 10;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadEventData();
  }

  loadEventData() {
    // TODO: Implement data loading from service
    setTimeout(() => {
      this.event = {
        title: 'Beach Cleanup Drive',
        imageUrl: 'https://source.unsplash.com/random/800x600/?beach',
        startDate: new Date('2024-04-15T09:00:00'),
        location: 'Miami Beach',
        registeredParticipants: 25,
        maxParticipants: 30
      };

      this.registeredParticipants = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@example.com',
          registrationDate: new Date('2024-03-01'),
          status: 'CONFIRMED',
          checkedIn: false
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          registrationDate: new Date('2024-03-02'),
          status: 'CONFIRMED',
          checkedIn: true,
          checkInTime: new Date('2024-04-15T08:45:00')
        }
      ];

      this.waitlistedParticipants = [
        {
          id: 3,
          name: 'Bob Wilson',
          email: 'bob.wilson@example.com',
          waitlistPosition: 1,
          joinDate: new Date('2024-03-10')
        }
      ];

      this.totalParticipants = 25;
      this.isLoading = false;
    }, 1000);
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'CONFIRMED': 'primary',
      'PENDING': 'accent',
      'CANCELLED': 'warn'
    };
    return statusColors[status] || 'basic';
  }

  onPageChange(event: PageEvent) {
    // TODO: Implement pagination
    console.log('Page changed:', event);
  }

  checkIn(participant: any) {
    // TODO: Implement check-in
    console.log('Check in participant:', participant);
    this.snackBar.open('Participant checked in successfully', 'Close', { duration: 3000 });
  }

  viewProfile(participant: any) {
    // TODO: Implement profile view
    console.log('View profile:', participant);
  }

  sendMessage(participant: any) {
    // TODO: Implement messaging
    console.log('Send message to:', participant);
    this.snackBar.open('Message sent successfully', 'Close', { duration: 3000 });
  }

  removeParticipant(participant: any) {
    // TODO: Implement removal with confirmation
    console.log('Remove participant:', participant);
    this.snackBar.open('Participant removed successfully', 'Close', { duration: 3000 });
  }

  promoteFromWaitlist(participant: any) {
    // TODO: Implement waitlist promotion
    console.log('Promote from waitlist:', participant);
    this.snackBar.open('Participant promoted from waitlist', 'Close', { duration: 3000 });
  }
} 