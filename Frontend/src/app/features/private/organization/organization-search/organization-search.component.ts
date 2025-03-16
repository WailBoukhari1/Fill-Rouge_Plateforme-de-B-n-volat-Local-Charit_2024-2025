import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTreeModule } from '@angular/material/tree';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { OrganizationService, OrganizationProfile } from '../../../../core/services/organization.service';
import { OrganizationCardComponent } from '../organization-card/organization-card.component';

@Component({
  selector: 'app-organization-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSliderModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatDividerModule,
    MatListModule,
    MatMenuModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatStepperModule,
    MatTreeModule,
    MatGridListModule,
    MatRadioModule,
    MatSidenavModule,
    OrganizationCardComponent
  ],
  template: `
    <div class="search-container">
      <mat-toolbar color="primary" class="search-toolbar">
        <span>Search Organizations</span>
      </mat-toolbar>

      <div class="content-container">
        @if (loading) {
          <div class="flex justify-center items-center h-64">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else {
          <!-- Search Results -->
          <div class="results-grid">
            @for (organization of organizations; track organization.id) {
              <app-organization-card [organization]="organization"></app-organization-card>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    .content-container {
      max-width: 1200px;
      margin: 24px auto;
      padding: 0 16px;
    }
    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }
  `]
})
export class OrganizationSearchComponent implements OnInit {
  loading = false;
  organizations: OrganizationProfile[] = [];

  constructor(
    private organizationService: OrganizationService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadOrganizations();
  }

  private loadOrganizations(): void {
    this.loading = true;
    this.organizationService.getOrganizations().subscribe({
      next: (orgs) => {
        this.organizations = orgs;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
        this.snackBar.open('Error loading organizations', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
} 