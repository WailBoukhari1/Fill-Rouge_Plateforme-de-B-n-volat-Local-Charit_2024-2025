import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, retry, catchError, throwError } from 'rxjs';
import { 
  IVolunteerFilters, 
  VolunteerStatus 
} from '../../../../core/models/volunteer.types';
import { 
  IOrganizationVolunteer,
  VolunteerRole
} from '../../../../core/models/organization-volunteer.types';
import { VolunteerService } from '../../../../core/services/volunteer.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-organization-volunteers',
  templateUrl: './organization-volunteers.component.html',
  styleUrls: ['./organization-volunteers.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ]
})
export class OrganizationVolunteersComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<IOrganizationVolunteer>([]);
  displayedColumns: string[] = [
    'profileImage',
    'name',
    'role',
    'status',
    'joinedDate',
    'totalHours',
    'completedEvents',
    'upcomingEvents',
    'lastActive',
    'rating',
    'actions'
  ];

  filters: IVolunteerFilters = {
    status: undefined,
    skills: [],
    searchTerm: '',
    sortBy: 'name',
    sortOrder: 'asc'
  };

  selectedRole: VolunteerRole | '' = '';
  statusOptions = Object.values(VolunteerStatus);
  roleOptions = Object.values(VolunteerRole);
  loading = true;
  error = '';

  private organizationId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private volunteerService: VolunteerService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.organizationId = this.authService.getCurrentOrganizationId();
    if (this.organizationId) {
      this.loadVolunteers();
    } else {
      this.error = 'Organization ID not found';
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadVolunteers(): void {
    if (!this.organizationId) return;

    this.loading = true;
    this.error = '';
    
    this.volunteerService.getOrganizationVolunteers(this.organizationId)
      .pipe(
        retry(2),
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error loading volunteers:', err);
          if (err.status === 500) {
            this.error = 'An unexpected server error occurred. Please try again later or contact support if the problem persists.';
          } else {
            this.error = err.error?.message || 
                        err.error?.error || 
                        'Failed to load volunteers. Please try again.';
          }
          this.loading = false;
          this.snackBar.open(this.error, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (volunteers: IOrganizationVolunteer[]) => {
          this.dataSource.data = volunteers;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.dataSource.filterPredicate = this.createFilter();
          this.loading = false;
          this.error = '';
        }
      });
  }

  private createFilter(): (data: IOrganizationVolunteer, filter: string) => boolean {
    return (data: IOrganizationVolunteer, filter: string): boolean => {
      const searchStr = JSON.parse(filter);
      const searchTerm = searchStr.searchTerm.toLowerCase();
      
      const matchesSearch = !searchTerm || 
        data.id.toLowerCase().includes(searchTerm) ||
        data.role.toLowerCase().includes(searchTerm) ||
        data.skills.some(skill => skill.toLowerCase().includes(searchTerm));

      const matchesStatus = !searchStr.status || data.status === searchStr.status;
      
      const matchesRole = !searchStr.role || data.role === searchStr.role;
      
      const matchesSkills = !searchStr.skills?.length || 
        searchStr.skills.every((skill: string) => data.skills.includes(skill));

      return matchesSearch && matchesStatus && matchesRole && matchesSkills;
    };
  }

  applyFilter(): void {
    const filterValue = JSON.stringify({
      searchTerm: this.filters.searchTerm,
      status: this.filters.status,
      role: this.selectedRole,
      skills: this.filters.skills
    });
    this.dataSource.filter = filterValue;
  }

  onSearch(searchTerm: string): void {
    this.filters.searchTerm = searchTerm;
    this.applyFilter();
  }

  onStatusFilter(status: VolunteerStatus | ''): void {
    this.filters.status = status === '' ? undefined : status;
    this.applyFilter();
  }

  onRoleFilter(role: VolunteerRole | ''): void {
    this.selectedRole = role;
    this.applyFilter();
  }

  updateVolunteerStatus(volunteer: IOrganizationVolunteer, newStatus: VolunteerStatus): void {
    if (!this.organizationId) return;

    this.volunteerService.updateVolunteerStatus(this.organizationId, volunteer.volunteerId, newStatus)
      .pipe(
        retry(1),
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error updating volunteer status:', err);
          const errorMessage = err.status === 500 
            ? 'An unexpected error occurred while updating status. Please try again later.'
            : err.error?.message || 'Failed to update volunteer status';
          
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (updatedVolunteer) => {
          const index = this.dataSource.data.findIndex(v => v.id === volunteer.id);
          if (index !== -1) {
            this.dataSource.data[index] = updatedVolunteer;
            this.dataSource._updateChangeSubscription();
          }
          this.snackBar.open('Volunteer status updated successfully', 'Close', {
            duration: 3000
          });
        }
      });
  }

  updateVolunteerRole(volunteer: IOrganizationVolunteer, newRole: VolunteerRole): void {
    if (!this.organizationId) return;

    this.volunteerService.updateVolunteerRole(this.organizationId, volunteer.volunteerId, newRole)
      .pipe(
        retry(1),
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error updating volunteer role:', err);
          const errorMessage = err.status === 500 
            ? 'An unexpected error occurred while updating role. Please try again later.'
            : err.error?.message || 'Failed to update volunteer role';
          
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (updatedVolunteer: IOrganizationVolunteer) => {
          const index = this.dataSource.data.findIndex(v => v.id === volunteer.id);
          if (index !== -1) {
            this.dataSource.data[index] = updatedVolunteer;
            this.dataSource._updateChangeSubscription();
          }
          this.snackBar.open('Volunteer role updated successfully', 'Close', {
            duration: 3000
          });
        }
      });
  }

  removeVolunteer(volunteer: IOrganizationVolunteer): void {
    if (!this.organizationId) return;

    if (confirm(`Are you sure you want to remove ${volunteer.id} from your organization?`)) {
      this.volunteerService.removeVolunteerFromOrganization(this.organizationId, volunteer.volunteerId)
        .pipe(
          retry(1),
          takeUntil(this.destroy$),
          catchError(err => {
            console.error('Error removing volunteer:', err);
            const errorMessage = err.status === 500 
              ? 'An unexpected error occurred while removing the volunteer. Please try again later.'
              : err.error?.message || 'Failed to remove volunteer';
            
            this.snackBar.open(errorMessage, 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            return throwError(() => err);
          })
        )
        .subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(v => v.id !== volunteer.id);
            this.snackBar.open('Volunteer removed successfully', 'Close', {
              duration: 3000
            });
          }
        });
    }
  }

  getStatusClass(status: VolunteerStatus): string {
    switch (status) {
      case VolunteerStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case VolunteerStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800';
      case VolunteerStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case VolunteerStatus.BLOCKED:
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  }

  getRoleClass(role: VolunteerRole): string {
    switch (role) {
      case VolunteerRole.REGULAR:
        return 'bg-blue-100 text-blue-800';
      case VolunteerRole.TEAM_LEAD:
        return 'bg-purple-100 text-purple-800';
      case VolunteerRole.COORDINATOR:
        return 'bg-indigo-100 text-indigo-800';
      case VolunteerRole.SUPERVISOR:
        return 'bg-pink-100 text-pink-800';
      default:
        return '';
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTimeAgo(date: Date | string | undefined): string {
    if (!date) return 'Never';
    const now = new Date();
    const past = new Date(date);
    const diffTime = Math.abs(now.getTime() - past.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }
} 