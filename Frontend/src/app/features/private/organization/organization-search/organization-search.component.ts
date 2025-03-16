import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
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
import { Router } from '@angular/router';
import { OrganizationService } from '../../../../core/services/organization.service';
import { OrganizationProfile } from '../../../../core/models/organization.model';
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

          <!-- Pagination -->
          @if (organizations.length > 0) {
            <mat-paginator
              [length]="totalItems"
              [pageSize]="pageSize"
              [pageIndex]="currentPage"
              [pageSizeOptions]="[12, 24, 36, 48]"
              (page)="onPageChange($event)"
              aria-label="Select page">
            </mat-paginator>
          }

          <!-- No Results -->
          @if (!loading && organizations.length === 0) {
            <div class="flex flex-col items-center justify-center p-8">
              <mat-icon class="text-4xl text-gray-400">search_off</mat-icon>
              <p class="mt-2 text-gray-600">No organizations found</p>
            </div>
          }
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
      margin-bottom: 24px;
    }
  `]
})
export class OrganizationSearchComponent implements OnInit {
  loading = false;
  organizations: OrganizationProfile[] = [];
  currentPage = 0;
  pageSize = 12;
  totalItems = 0;

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
    this.organizationService.getOrganizations(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.organizations = response.content;
        this.totalItems = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
        this.snackBar.open('Error loading organizations', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOrganizations();
  }
} 