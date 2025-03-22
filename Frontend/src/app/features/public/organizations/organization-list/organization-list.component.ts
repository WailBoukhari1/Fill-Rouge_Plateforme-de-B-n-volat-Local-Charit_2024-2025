import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationService } from '../../../../core/services/organization.service';
import { OrganizationProfile } from '../../../../core/models/organization.model';
import { OrganizationCardComponent } from '../../../private/organization/organization-card/organization-card.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    OrganizationCardComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="container mx-auto p-4">
      @if (loading) {
        <div class="flex justify-center items-center h-64">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (organization of organizations; track organization.id) {
            <app-organization-card [organization]="organization"></app-organization-card>
          }
        </div>

        @if (organizations.length > 0) {
          <mat-paginator
            [length]="totalItems"
            [pageSize]="pageSize"
            [pageIndex]="currentPage"
            [pageSizeOptions]="[12, 24, 36]"
            (page)="onPageChange($event)"
            aria-label="Select page">
          </mat-paginator>
        }

        @if (!loading && organizations.length === 0) {
          <div class="text-center py-8">
            <p class="text-gray-500">No organizations found</p>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
    }
  `]
})
export class OrganizationListComponent implements OnInit {
  organizations: OrganizationProfile[] = [];
  loading = false;
  currentPage = 0;
  pageSize = 12;
  totalItems = 0;

  constructor(
    private organizationService: OrganizationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadOrganizations();
  }

  private loadOrganizations(): void {
    this.loading = true;
    this.organizationService.getAllOrganizations(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.organizations = response.content;
        this.totalItems = response.totalElements;
        this.loading = false;
      },
      error: (error: any) => {
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