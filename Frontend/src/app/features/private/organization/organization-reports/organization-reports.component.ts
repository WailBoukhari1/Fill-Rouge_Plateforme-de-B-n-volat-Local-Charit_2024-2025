import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrganizationService } from '../../../../core/services/organization.service';

@Component({
  selector: 'app-organization-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Reports & Analytics</h1>

      <mat-tab-group>
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <!-- Total Volunteers Card -->
              <mat-card>
                <mat-card-content>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-gray-600 text-sm">Total Volunteers</p>
                      <h3 class="text-2xl font-bold">{{totalVolunteers}}</h3>
                    </div>
                    <mat-icon class="text-primary-600">people</mat-icon>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Total Events Card -->
              <mat-card>
                <mat-card-content>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-gray-600 text-sm">Total Events</p>
                      <h3 class="text-2xl font-bold">{{totalEvents}}</h3>
                    </div>
                    <mat-icon class="text-primary-600">event</mat-icon>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Total Hours Card -->
              <mat-card>
                <mat-card-content>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-gray-600 text-sm">Total Hours</p>
                      <h3 class="text-2xl font-bold">{{totalHours}}</h3>
                    </div>
                    <mat-icon class="text-primary-600">schedule</mat-icon>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <!-- Volunteer Growth Chart -->
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Volunteer Growth</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <!-- Add chart component here -->
                  <div class="h-64 flex items-center justify-center bg-gray-100">
                    Chart Placeholder
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Event Participation Chart -->
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Event Participation</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <!-- Add chart component here -->
                  <div class="h-64 flex items-center justify-center bg-gray-100">
                    Chart Placeholder
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- Volunteer Reports Tab -->
        <mat-tab label="Volunteer Reports">
          <div class="p-4">
            <mat-card>
              <mat-card-content>
                <div class="flex flex-wrap gap-4 mb-4">
                  <!-- Date Range Selector -->
                  <mat-form-field>
                    <mat-label>Start Date</mat-label>
                    <input matInput [matDatepicker]="startPicker">
                    <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                    <mat-datepicker #startPicker></mat-datepicker>
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>End Date</mat-label>
                    <input matInput [matDatepicker]="endPicker">
                    <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                    <mat-datepicker #endPicker></mat-datepicker>
                  </mat-form-field>

                  <!-- Report Type Selector -->
                  <mat-form-field>
                    <mat-label>Report Type</mat-label>
                    <mat-select>
                      <mat-option value="activity">Activity Report</mat-option>
                      <mat-option value="hours">Hours Report</mat-option>
                      <mat-option value="impact">Impact Report</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <button mat-raised-button color="primary">
                    <mat-icon class="mr-2">download</mat-icon>
                    Generate Report
                  </button>
                </div>

                <!-- Report Preview -->
                <div class="bg-gray-100 p-4 rounded">
                  <p class="text-gray-600">Select parameters and generate a report to see preview</p>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Event Reports Tab -->
        <mat-tab label="Event Reports">
          <div class="p-4">
            <mat-card>
              <mat-card-content>
                <div class="flex flex-wrap gap-4 mb-4">
                  <!-- Event Selector -->
                  <mat-form-field class="w-full md:w-auto">
                    <mat-label>Select Event</mat-label>
                    <mat-select>
                      <mat-option value="all">All Events</mat-option>
                      <!-- Add event options dynamically -->
                    </mat-select>
                  </mat-form-field>

                  <button mat-raised-button color="primary">
                    <mat-icon class="mr-2">assessment</mat-icon>
                    Generate Event Report
                  </button>
                </div>

                <!-- Event Statistics -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <mat-card>
                    <mat-card-content>
                      <p class="text-gray-600 text-sm">Participation Rate</p>
                      <h4 class="text-xl font-bold">85%</h4>
                    </mat-card-content>
                  </mat-card>

                  <mat-card>
                    <mat-card-content>
                      <p class="text-gray-600 text-sm">Average Hours</p>
                      <h4 class="text-xl font-bold">4.5</h4>
                    </mat-card-content>
                  </mat-card>

                  <mat-card>
                    <mat-card-content>
                      <p class="text-gray-600 text-sm">Satisfaction Rate</p>
                      <h4 class="text-xl font-bold">4.8/5.0</h4>
                    </mat-card-content>
                  </mat-card>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .mat-mdc-card {
      margin-bottom: 1rem;
    }

    .mat-mdc-tab-group {
      margin-top: 1rem;
    }
  `]
})
export class OrganizationReportsComponent implements OnInit {
  totalVolunteers = 0;
  totalEvents = 0;
  totalHours = 0;

  constructor(private organizationService: OrganizationService) {}

  ngOnInit() {
    this.loadReportData();
  }

  private loadReportData() {
    // TODO: Implement actual API calls
    // Mock data for now
    this.totalVolunteers = 150;
    this.totalEvents = 25;
    this.totalHours = 750;
  }
} 