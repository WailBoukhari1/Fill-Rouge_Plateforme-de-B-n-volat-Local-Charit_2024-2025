import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserService } from '../../../../core/services/user.service';
import { User, UserRole } from '../../../../core/models/auth.models';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AppState } from '../../../../store';
import * as AdminActions from '../../../../store/admin/admin.actions';
import * as AdminSelectors from '../../../../store/admin/admin.selectors';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatChipsModule,
    MatSnackBarModule,
    MatSelectModule,
    MatDialogModule,
    FormsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="min-h-screen from-indigo-50 via-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
            <p class="mt-2 text-gray-600 text-lg">Manage and moderate all users on the platform</p>
          </div>
        </div>

        <!-- Main Content -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <!-- Loading State -->
          <div *ngIf="loading$ | async" class="flex justify-center items-center py-16">
            <mat-spinner diameter="48" class="text-indigo-600"></mat-spinner>
          </div>

          <!-- Error State -->
          <div *ngIf="error$ | async as error" class="p-6 text-center">
            <div class="bg-red-50 border-2 border-red-200 rounded-xl p-6 inline-flex flex-col items-center">
              <mat-icon class="text-red-500 text-4xl mb-4">error_outline</mat-icon>
              <p class="text-red-600 text-lg font-medium">{{ error }}</p>
              <button 
                mat-raised-button 
                color="primary" 
                (click)="loadUsers()" 
                class="mt-4 flex items-center gap-2 bg-red-600 hover:bg-red-700">
                <mat-icon>refresh</mat-icon>
                Retry
              </button>
            </div>
          </div>

          <!-- Table -->
          <div *ngIf="!(loading$ | async) && !(error$ | async)" class="overflow-x-auto">
            <table mat-table [dataSource]="dataSource" class="w-full">
              <!-- Avatar Column -->
              <ng-container matColumnDef="avatar">
                <th mat-header-cell *matHeaderCellDef class="bg-indigo-50 text-indigo-800 font-medium px-6 py-4">Avatar</th>
                <td mat-cell *matCellDef="let user" class="px-6 py-4">
                  <img [src]="user.profilePicture || 'assets/images/default-avatar.png'" 
                       alt="User avatar"
                       class="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-100 shadow-sm">
                </td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef class="bg-indigo-50 text-indigo-800 font-medium px-6 py-4">Name</th>
                <td mat-cell *matCellDef="let user" class="px-6 py-4">
                  <div class="font-medium text-gray-900">{{user.firstName}} {{user.lastName}}</div>
                  <div *ngIf="user.username" class="text-sm text-gray-500">{{ '@' + user.username }}</div>
                </td>
              </ng-container>

              <!-- Email Column -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef class="bg-indigo-50 text-indigo-800 font-medium px-6 py-4">Email</th>
                <td mat-cell *matCellDef="let user" class="px-6 py-4">
                  <div class="flex items-center text-gray-600">
                    <mat-icon class="text-indigo-400 mr-2 text-sm">email</mat-icon>
                    <span class="text-sm font-medium">{{user.email}}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Role Column -->
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef class="bg-indigo-50 text-indigo-800 font-medium px-6 py-4">Role</th>
                <td mat-cell *matCellDef="let user" class="px-6 py-4">
                  <mat-select [value]="user.role" 
                              (selectionChange)="changeUserRole(user, $event.value)" 
                              class="w-full py-1 px-2 border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-200">
                    <mat-option *ngFor="let role of availableRoles" [value]="role" class="text-sm">
                      {{role}}
                    </mat-option>
                  </mat-select>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef class="bg-indigo-50 text-indigo-800 font-medium px-6 py-4">Status</th>
                <td mat-cell *matCellDef="let user" class="px-6 py-4">
                  <span [class]="getStatusClasses(user)">
                    <mat-icon class="h-4 w-4 mr-1">{{getStatusIcon(user)}}</mat-icon>
                    {{getStatusText(user)}}
                  </span>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="bg-indigo-50 text-indigo-800 font-medium px-6 py-4 text-right">Actions</th>
                <td mat-cell *matCellDef="let user" class="px-6 py-4 text-right">
                  <button mat-icon-button 
                          [matMenuTriggerFor]="menu"
                          class="text-indigo-400 hover:text-indigo-600 transition-colors duration-200 focus:outline-none">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu" class="rounded-xl shadow-lg">
                    <button mat-menu-item (click)="viewDetails(user)" class="hover:bg-indigo-50">
                      <mat-icon class="text-blue-500">visibility</mat-icon>
                      <span class="ml-2">View Details</span>
                    </button>
                    <button *ngIf="!user.emailVerified" mat-menu-item (click)="resendVerification(user)" class="hover:bg-indigo-50">
                      <mat-icon class="text-green-500">mail</mat-icon>
                      <span class="ml-2">Resend Verification</span>
                    </button>
                    <button *ngIf="!user.accountLocked" mat-menu-item (click)="lockAccount(user)" class="hover:bg-indigo-50">
                      <mat-icon class="text-yellow-500">lock</mat-icon>
                      <span class="ml-2">Ban User</span>
                    </button>
                    <button *ngIf="user.accountLocked" mat-menu-item (click)="unlockAccount(user)" class="hover:bg-indigo-50">
                      <mat-icon class="text-green-500">lock_open</mat-icon>
                      <span class="ml-2">Unban User</span>
                    </button>
                    <button mat-menu-item (click)="deleteUser(user)" class="hover:bg-indigo-50">
                      <mat-icon class="text-red-500">delete</mat-icon>
                      <span class="ml-2 text-red-500">Delete</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns" class="bg-indigo-50"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                  class="hover:bg-indigo-50 transition-colors duration-200 border-b border-gray-100"></tr>
            </table>
          </div>

          <!-- No Data State -->
          <div *ngIf="!(loading$ | async) && !(error$ | async) && dataSource.data.length === 0" class="flex flex-col items-center justify-center py-16">
            <mat-icon class="text-indigo-300 text-6xl mb-4">people_outline</mat-icon>
            <p class="text-lg text-gray-600 font-medium mb-1">No users found</p>
            <p class="text-sm text-gray-500 mb-4">Try refreshing or adjusting your search</p>
            <button 
              mat-raised-button 
              color="primary" 
              (click)="loadUsers()" 
              class="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl shadow-sm">
              <div class="flex items-center gap-2">
                <mat-icon>refresh</mat-icon>
                <span>Refresh Users</span>
              </div>
            </button>
          </div>

          <!-- Paginator -->
          <mat-paginator
            *ngIf="!(loading$ | async) && !(error$ | async) && dataSource.data.length > 0"
            [length]="totalUsers$ | async"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25, 100]"
            (page)="onPageChange($event)"
            class="border-t border-gray-200 bg-gray-50">
          </mat-paginator>
        </div>
      </div>
    </div>

    <!-- User Details Dialog Template -->
    <ng-template #userDetailsDialog let-data>
      <div class="p-4">
        <div class="flex items-center gap-4 mb-6">
          <img [src]="data.profilePicture || 'assets/images/default-avatar.png'" 
               alt="User avatar"
               class="w-20 h-20 rounded-full object-cover ring-2 ring-indigo-100 shadow-sm">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{data.firstName}} {{data.lastName}}</h2>
            <p *ngIf="data.username" class="text-indigo-600">{{ '@' + data.username }}</p>
            <div class="flex items-center mt-1">
              <span [class]="getStatusClasses(data)">
                <mat-icon class="h-4 w-4 mr-1">{{getStatusIcon(data)}}</mat-icon>
                {{getStatusText(data)}}
              </span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div class="flex flex-col border border-gray-200 p-4 rounded-lg bg-gray-50">
            <span class="text-sm text-gray-500">Email</span>
            <div class="flex items-center text-gray-900 mt-1">
              <mat-icon class="text-indigo-400 mr-2 text-sm">email</mat-icon>
              <span>{{data.email}}</span>
            </div>
          </div>
          
          <div class="flex flex-col border border-gray-200 p-4 rounded-lg bg-gray-50">
            <span class="text-sm text-gray-500">Role</span>
            <div class="flex items-center text-gray-900 mt-1">
              <mat-icon class="text-indigo-400 mr-2 text-sm">badge</mat-icon>
              <span>{{data.role}}</span>
            </div>
          </div>

          <div class="flex flex-col border border-gray-200 p-4 rounded-lg bg-gray-50">
            <span class="text-sm text-gray-500">Registration Date</span>
            <div class="flex items-center text-gray-900 mt-1">
              <mat-icon class="text-indigo-400 mr-2 text-sm">calendar_today</mat-icon>
              <span>{{data.createdAt | date: 'medium'}}</span>
            </div>
          </div>

          <!-- <div class="flex flex-col border border-gray-200 p-4 rounded-lg bg-gray-50">
            <span class="text-sm text-gray-500">Last Login</span>
            <div class="flex items-center text-gray-900 mt-1">
              <mat-icon class="text-indigo-400 mr-2 text-sm">login</mat-icon>
              <span>{{data.lastLogin ? (data.lastLogin | date: 'medium') : 'Never logged in'}}</span>
            </div>
          </div> -->
        </div>

        <div *ngIf="data.bio || data.location" class="border border-gray-200 p-4 rounded-lg bg-gray-50 mb-6">
          <h3 class="font-medium mb-2 text-gray-800">About</h3>
          <p *ngIf="data.location" class="flex items-center text-sm mb-2">
            <mat-icon class="text-indigo-400 mr-2 text-sm">location_on</mat-icon>
            {{data.location}}
          </p>
          <p *ngIf="data.bio" class="text-sm text-gray-700">{{data.bio}}</p>
        </div>

        <div class="flex justify-end gap-2">
          <button mat-button color="primary" mat-dialog-close class="text-indigo-600">Close</button>
          <button *ngIf="!data.accountLocked" mat-raised-button color="warn" (click)="lockUserFromDialog(data)" class="bg-red-600">Ban User</button>
          <button *ngIf="data.accountLocked" mat-raised-button color="accent" (click)="unlockUserFromDialog(data)" class="bg-green-600">Unban User</button>
        </div>
      </div>
    </ng-template>
  `
})
export class UserManagementComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['avatar', 'name', 'email', 'role', 'status', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  pageSize = 10;
  currentPage = 0;
  availableRoles = Object.values(UserRole);
  private destroy$ = new Subject<void>();

  // NgRx selectors
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  totalUsers$: Observable<number>;

  // Add ViewChild reference - make it optional with !
  @ViewChild('userDetailsDialog') userDetailsDialog!: TemplateRef<any>;

  constructor(
    private store: Store<AppState>,
    private userService: UserService, 
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.loading$ = this.store.select(AdminSelectors.selectAdminLoading);
    this.error$ = this.store.select(AdminSelectors.selectAdminError);
    this.totalUsers$ = this.store.select(AdminSelectors.selectTotalUsersCount);
  }

  ngOnInit(): void {
    this.loadUsers();
    
    // Subscribe to users from the store with takeUntil to avoid memory leaks
    this.store.select(AdminSelectors.selectAllUsers)
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => {
        if (users) {
          this.dataSource.data = users;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    // Cancel any previous requests by unsubscribing
    this.store.dispatch(AdminActions.loadUsers({ 
      page: this.currentPage,
      size: this.pageSize 
    }));
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  getRoleColor(role: UserRole): string {
    const colors: { [key in UserRole]: string } = {
      [UserRole.ADMIN]: 'primary',
      [UserRole.VOLUNTEER]: 'accent',
      [UserRole.ORGANIZATION]: 'warn',
      [UserRole.UNASSIGNED]: ''
    };
    return colors[role] || '';
  }

  getStatusColor(user: User): string {
    if (user.accountLocked) return 'warn';
    if (!user.emailVerified) return 'accent';
    return 'primary';
  }

  /**
   * Returns the CSS classes for user status badges
   */
  getStatusClasses(user: User): string {
    let baseClasses = 'inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ';
    
    if (user.accountLocked) {
      return baseClasses + 'bg-red-100 text-red-800';
    }
    if (!user.emailVerified) {
      return baseClasses + 'bg-yellow-100 text-yellow-800';
    }
    return baseClasses + 'bg-green-100 text-green-800';
  }

  /**
   * Returns the icon for user status
   */
  getStatusIcon(user: User): string {
    if (user.accountLocked) return 'lock';
    if (!user.emailVerified) return 'mail_outline';
    return 'check_circle';
  }

  getStatusText(user: User): string {
    if (user.accountLocked) return 'Banned';
    if (!user.emailVerified) return 'Unverified';
    return 'Active';
  }

  /**
   * Opens a dialog to display detailed user information
   */
  viewDetails(user: User): void {
    this.dialog.open(this.userDetailsDialog, {
      width: '600px',
      data: user,
      panelClass: 'user-details-dialog'
    });
  }

  /**
   * Method to lock a user from the details dialog
   */
  lockUserFromDialog(user: User): void {
    this.dialog.closeAll();
    this.lockAccount(user);
  }

  /**
   * Method to unlock a user from the details dialog
   */
  unlockUserFromDialog(user: User): void {
    this.dialog.closeAll();
    this.unlockAccount(user);
  }

  resendVerification(user: User): void {
    this.userService.resendVerificationEmail(user.email).subscribe({
      next: () => {
        this.snackBar.open(`Verification email sent to ${user.email}`, 'Close', { duration: 3000 });
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error resending verification:', error);
        this.snackBar.open('Failed to send verification email', 'Close', { duration: 5000 });
      }
    });
  }

  lockAccount(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Ban User',
        message: `Are you sure you want to ban ${user.firstName} ${user.lastName}? They will no longer be able to access the system.`,
        confirmText: 'Ban User',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(AdminActions.lockUserAccount({ userId: user.id }));
      }
    });
  }

  unlockAccount(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Unban User',
        message: `Are you sure you want to unban ${user.firstName} ${user.lastName}? They will be able to access the system again.`,
        confirmText: 'Unban User',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(AdminActions.unlockUserAccount({ userId: user.id }));
      }
    });
  }

  changeUserRole(user: User, newRole: UserRole): void {
    if (user.role === newRole) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Change User Role',
        message: `Are you sure you want to change ${user.firstName} ${user.lastName}'s role from ${user.role} to ${newRole}?`,
        confirmText: 'Change Role',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(AdminActions.updateUserRole({ userId: user.id, role: newRole }));
      }
    });
  }

  deleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to permanently delete ${user.firstName} ${user.lastName}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(AdminActions.deleteUser({ userId: user.id }));
      }
    });
  }
} 