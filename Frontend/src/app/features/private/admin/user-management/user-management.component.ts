import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../../core/services/user.service';
import { User, UserRole } from '../../../../core/models/auth.models';

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
    MatSnackBarModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">User Management</h1>
        <button mat-raised-button color="primary" routerLink="create">
          <mat-icon>person_add</mat-icon>
          Add User
        </button>
      </div>

      <mat-card>
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="users" class="w-full">
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
                <mat-chip [color]="getRoleColor(user.role)">
                  {{user.role}}
                </mat-chip>
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
                  <button mat-menu-item [routerLink]="[user.id]">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
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
                      <span>Lock Account</span>
                    </button>
                  } @else {
                    <button mat-menu-item (click)="unlockAccount(user)">
                      <mat-icon>lock_open</mat-icon>
                      <span>Unlock Account</span>
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

        <mat-paginator
          [length]="totalItems"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25, 100]"
          (page)="onPageChange($event)">
        </mat-paginator>
      </mat-card>
    </div>
  `
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['avatar', 'name', 'email', 'role', 'status', 'actions'];
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;

  constructor(private userService: UserService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.users = response.content;
        this.totalItems = response.totalElements;
      },
      error: (error) => console.error('Error loading users:', error)
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  getRoleColor(role: UserRole): string {
    const colors: { [key in UserRole]: string } = {
      [UserRole.ADMIN]: 'primary',
      [UserRole.ORGANIZATION]: 'accent',
      [UserRole.VOLUNTEER]: 'warn'
    };
    return colors[role] || '';
  }

  getStatusColor(user: User): string {
    if (user.accountLocked) return 'warn';
    if (!user.emailVerified) return 'accent';
    return 'primary';
  }

  getStatusText(user: User): string {
    if (user.accountLocked) return 'Locked';
    if (!user.emailVerified) return 'Unverified';
    return 'Active';
  }

  viewDetails(user: User): void {
    // Navigate to user details view
  }

  resendVerification(user: User): void {
    this.userService.resendVerificationEmail(user.email).subscribe({
      next: () => {
        // Show success message
      },
      error: (error) => console.error('Error resending verification:', error)
    });
  }

  lockAccount(user: User): void {
    this.userService.lockUserAccount(user.id).subscribe({
      next: () => this.loadUsers(),
      error: (error) => console.error('Error locking account:', error)
    });
  }

  unlockAccount(user: User): void {
    this.userService.unlockUserAccount(user.id).subscribe({
      next: () => this.loadUsers(),
      error: (error) => console.error('Error unlocking account:', error)
    });
  }

  deleteUser(user: User): void {
    // Implement deletion confirmation dialog and logic
  }
} 