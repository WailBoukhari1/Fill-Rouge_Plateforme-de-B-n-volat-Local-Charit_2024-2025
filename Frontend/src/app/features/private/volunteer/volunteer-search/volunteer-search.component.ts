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
import { VolunteerService, VolunteerProfile } from '../../../../core/services/volunteer.service';
import { VolunteerProfileCardComponent } from '../volunteer-profile-card/volunteer-profile-card.component';

@Component({
  selector: 'app-volunteer-search',
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
    VolunteerProfileCardComponent
  ],
  template: `
    <div class="search-container">
      <!-- Search Header -->
      <mat-toolbar color="primary" class="search-toolbar">
        <button mat-icon-button (click)="goBack()" matTooltip="Back">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Search Volunteers</span>
        <span class="toolbar-spacer"></span>
      </mat-toolbar>

      <div class="content-container">
        <!-- Search Form -->
        <mat-card class="search-form-card">
          <mat-card-content>
            <form [formGroup]="searchForm" (ngSubmit)="onSearch()">
              <div class="search-grid">
                <!-- Basic Search -->
                <mat-form-field class="search-field">
                  <mat-label>Search</mat-label>
                  <input matInput formControlName="query" placeholder="Search by name, skills, or interests">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>

                <!-- Location -->
                <mat-form-field class="search-field">
                  <mat-label>Location</mat-label>
                  <input matInput formControlName="location" placeholder="City or region">
                  <mat-icon matSuffix>location_on</mat-icon>
                </mat-form-field>

                <!-- Skills -->
                <mat-form-field class="search-field">
                  <mat-label>Skills</mat-label>
                  <mat-chip-grid #chipGrid>
                    <mat-chip-row *ngFor="let skill of selectedSkills" (removed)="removeSkill(skill)">
                      {{skill}}
                      <button matChipRemove>
                        <mat-icon>cancel</mat-icon>
                      </button>
                    </mat-chip-row>
                  </mat-chip-grid>
                  <input placeholder="Add skills..."
                         [matChipInputFor]="chipGrid"
                         (matChipInputTokenEnd)="addSkill($event)">
                </mat-form-field>

                <!-- Availability -->
                <mat-form-field class="search-field">
                  <mat-label>Availability</mat-label>
                  <mat-select formControlName="availability" multiple>
                    <mat-option value="MORNING">Morning</mat-option>
                    <mat-option value="AFTERNOON">Afternoon</mat-option>
                    <mat-option value="EVENING">Evening</mat-option>
                    <mat-option value="WEEKEND">Weekend</mat-option>
                  </mat-select>
                </mat-form-field>

                <!-- Advanced Search Toggle -->
                <div class="advanced-search-toggle">
                  <mat-slide-toggle formControlName="showAdvanced">
                    Advanced Search
                  </mat-slide-toggle>
                </div>
              </div>

              <!-- Advanced Search Options -->
              <div *ngIf="searchForm.get('showAdvanced')?.value" class="advanced-search">
                <mat-divider></mat-divider>
                <div class="advanced-grid">
                  <!-- Experience Level -->
                  <mat-form-field>
                    <mat-label>Experience Level</mat-label>
                    <mat-select formControlName="experienceLevel">
                      <mat-option value="BEGINNER">Beginner</mat-option>
                      <mat-option value="INTERMEDIATE">Intermediate</mat-option>
                      <mat-option value="EXPERT">Expert</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <!-- Languages -->
                  <mat-form-field>
                    <mat-label>Languages</mat-label>
                    <mat-select formControlName="languages" multiple>
                      <mat-option value="ENGLISH">English</mat-option>
                      <mat-option value="FRENCH">French</mat-option>
                      <mat-option value="SPANISH">Spanish</mat-option>
                      <mat-option value="GERMAN">German</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <!-- Certifications -->
                  <mat-form-field>
                    <mat-label>Certifications</mat-label>
                    <mat-select formControlName="certifications" multiple>
                      <mat-option value="FIRST_AID">First Aid</mat-option>
                      <mat-option value="CPR">CPR</mat-option>
                      <mat-option value="EMERGENCY_RESPONSE">Emergency Response</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <!-- Reliability Score Range -->
                  <div class="slider-container">
                    <label>Minimum Reliability Score</label>
                    <mat-slider min="0" max="100" step="1" discrete>
                      <input matSliderThumb formControlName="reliabilityScore">
                    </mat-slider>
                    <span>{{searchForm.get('reliabilityScore')?.value}}%</span>
                  </div>
                </div>
              </div>

              <!-- Search Actions -->
              <div class="search-actions">
                <button mat-button type="button" (click)="resetSearch()">
                  Reset
                </button>
                <button mat-raised-button color="primary" type="submit" [disabled]="loading">
                  <mat-icon>search</mat-icon>
                  Search
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Search Results -->
        <div *ngIf="searchResults.length > 0" class="results-section">
          <div class="results-header">
            <h2>Search Results</h2>
            <span class="results-count">{{totalResults}} volunteers found</span>
          </div>

          <div class="results-grid">
            <app-volunteer-profile-card
              *ngFor="let volunteer of searchResults"
              [volunteer]="volunteer"
              (click)="viewProfile(volunteer.id)">
            </app-volunteer-profile-card>
          </div>

          <!-- Pagination -->
          <mat-paginator
            [length]="totalResults"
            [pageSize]="pageSize"
            [pageIndex]="currentPage"
            [pageSizeOptions]="[12, 24, 36, 48]"
            (page)="onPageChange($event)">
          </mat-paginator>
        </div>

        <!-- No Results -->
        <div *ngIf="!loading && searchResults.length === 0" class="no-results">
          <mat-icon>search_off</mat-icon>
          <p>No volunteers found matching your search criteria</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="loading-container">
          <mat-progress-spinner mode="indeterminate" diameter="50"></mat-progress-spinner>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .search-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .content-container {
      max-width: 1200px;
      margin: 24px auto;
      padding: 0 16px;
    }

    .search-form-card {
      margin-bottom: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .search-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .search-field {
      width: 100%;
    }

    .advanced-search-toggle {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 8px;
    }

    .advanced-search {
      margin-top: 16px;
      padding-top: 16px;
    }

    .advanced-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .slider-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .search-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 24px;
    }

    .results-section {
      margin-top: 24px;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .results-count {
      color: #666;
      font-size: 0.875rem;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
      color: #666;
    }

    .no-results mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    @media (max-width: 600px) {
      .search-grid {
        grid-template-columns: 1fr;
      }

      .advanced-grid {
        grid-template-columns: 1fr;
      }

      .results-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class VolunteerSearchComponent implements OnInit {
  searchForm: FormGroup;
  selectedSkills: string[] = [];
  searchResults: VolunteerProfile[] = [];
  totalResults = 0;
  currentPage = 0;
  pageSize = 12;
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private volunteerService: VolunteerService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.searchForm = this.formBuilder.group({
      query: [''],
      location: [''],
      availability: [[]],
      showAdvanced: [false],
      experienceLevel: [''],
      languages: [[]],
      certifications: [[]],
      reliabilityScore: [0]
    });
  }

  ngOnInit(): void {
    // Initialize any necessary data
  }

  onSearch(): void {
    if (this.loading) return;

    this.loading = true;
    const formValue = this.searchForm.value;

    // Construct search parameters
    const searchParams = {
      query: formValue.query,
      location: formValue.location,
      skills: this.selectedSkills,
      availability: formValue.availability,
      experienceLevel: formValue.experienceLevel,
      languages: formValue.languages,
      certifications: formValue.certifications,
      reliabilityScore: formValue.reliabilityScore,
      page: this.currentPage,
      size: this.pageSize
    };

    this.volunteerService.searchVolunteers(searchParams).subscribe({
      next: (response) => {
        this.searchResults = response.volunteers;
        this.totalResults = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching volunteers:', error);
        this.snackBar.open('Error searching volunteers', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  resetSearch(): void {
    this.searchForm.reset({
      query: '',
      location: '',
      availability: [],
      showAdvanced: false,
      experienceLevel: '',
      languages: [],
      certifications: [],
      reliabilityScore: 0
    });
    this.selectedSkills = [];
    this.searchResults = [];
    this.totalResults = 0;
    this.currentPage = 0;
  }

  addSkill(event: any): void {
    const value = (event.value || '').trim();
    if (value) {
      this.selectedSkills.push(value);
      event.chipInput!.clear();
    }
  }

  removeSkill(skill: string): void {
    const index = this.selectedSkills.indexOf(skill);
    if (index >= 0) {
      this.selectedSkills.splice(index, 1);
    }
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.onSearch();
  }

  viewProfile(volunteerId: string): void {
    this.router.navigate(['/dashboard/volunteer/profile', volunteerId]);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/volunteer/events']);
  }
} 