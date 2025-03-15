import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { VolunteerRoutingModule } from './volunteer-routing.module';
import { VolunteerDashboardComponent } from './dashboard/volunteer-dashboard.component';
import { VolunteerEventsComponent } from './events/volunteer-events.component';
import { VolunteerAchievementsComponent } from './achievements/volunteer-achievements.component';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';

@NgModule({
  declarations: [
    VolunteerDashboardComponent,
    VolunteerEventsComponent,
    VolunteerAchievementsComponent,
  ],
  imports: [
    CommonModule,
    VolunteerRoutingModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatListModule,
    MatBadgeModule,
  ],
})
export class VolunteerModule {}
