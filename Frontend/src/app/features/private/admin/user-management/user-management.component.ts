import { Component, OnInit, OnDestroy } from '@angular/core';
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
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">User Management</h1>
      </div>

      <mat-card>
        <div *ngIf="loading$ | async" class="flex justify-center p-4">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div *ngIf="!(loading$ | async)" class="overflow-x-auto">
          <table mat-table [dataSource]="dataSource" class="w-full">
            <!-- Avatar Column -->
            <ng-container matColumnDef="avatar">
              <th mat-header-cell *matHeaderCellDef>Avatar</th>
              <td mat-cell *matCellDef="let user">
                <img [src]="user.profilePicture || 'assets/images/default-avatar.png'" 
                     alt="User avatar"
                     class="w-10 h-10 rounded-full object-cover">
              </td>
            </ng-container>

            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let user">
                {{user.firstName}} {{user.lastName}}
              </td>
            </ng-container>

            <!-- Email Column -->
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let user">{{user.email}}</td>
            </ng-container>

            <!-- Role Column -->
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let user">
                <mat-select [value]="user.role" (selectionChange)="changeUserRole(user, $event.value)" class="w-full">
                  <mat-option *ngFor="let role of availableRoles" [value]="role">
                    {{role}}
                  </mat-option>
                </mat-select>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let user">
                <mat-chip [color]="getStatusColor(user)">
                  {{getStatusText(user)}}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let user">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="viewDetails(user)">
                    <mat-icon>visibility</mat-icon>
                    <span>View Details</span>
                  </button>
                  @if (!user.emailVerified) {
                    <button mat-menu-item (click)="resendVerification(user)">
                      <mat-icon>mail</mat-icon>
                      <span>Resend Verification</span>
                    </button>
                  }
                  @if (!user.accountLocked) {
                    <button mat-menu-item (click)="lockAccount(user)">
                      <mat-icon>lock</mat-icon>
                      <span>Ban User</span>
                    </button>
                  } @else {
                    <button mat-menu-item (click)="unlockAccount(user)">
                      <mat-icon>lock_open</mat-icon>
                      <span>Unban User</span>
                    </button>
                  }
                  <button mat-menu-item (click)="deleteUser(user)" class="text-red-500">
                    <mat-icon class="text-red-500">delete</mat-icon>
                    <span>Delete</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <div *ngIf="error$ | async as error" class="p-4 text-red-600 text-center">
          {{ error }}
        </div>

        <mat-paginator
          [length]="totalUsers$ | async"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25, 100]"
          (page)="onPageChange($event)">
        </mat-paginator>
      </mat-card>
    </div>
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

  getStatusText(user: User): string {
    if (user.accountLocked) return 'Banned';
    if (!user.emailVerified) return 'Unverified';
    return 'Active';
  }

  viewDetails(user: User): void {
    // Navigate to user details view
    this.snackBar.open(`Viewing details for ${user.firstName} ${user.lastName}`, 'Close', { duration: 3000 });
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