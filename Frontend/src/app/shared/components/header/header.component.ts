import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../components/auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <mat-toolbar class="bg-white shadow-sm">
      <div class="container mx-auto px-4 flex items-center justify-between h-16">
        <div class="flex items-center">
          <a  class="text-xl font-bold text-gray-800">
            Volunteering Platform
          </a>
        </div>

        <div class="flex items-center gap-4">
          @if (authService.currentUser$ | async; as user) {
            <div class="flex items-center gap-2">
              <button mat-button [matMenuTriggerFor]="userMenu">
                <mat-icon>account_circle</mat-icon>
                <span class="ml-1">{{ user.sub }}</span>
              </button>
              <mat-menu #userMenu="matMenu">
                <button mat-menu-item routerLink="/app/profile">
                  <mat-icon>person</mat-icon>
                  <span>Profile</span>
                </button>
                <button mat-menu-item (click)="logout()">
                  <mat-icon>exit_to_app</mat-icon>
                  <span>Logout</span>
                </button>
              </mat-menu>
            </div>
          } @else {
            <a mat-button routerLink="/auth/login">Login</a>
            <a mat-raised-button color="primary" routerLink="/auth/register">
              Register
            </a>
          }
        </div>
      </div>
    </mat-toolbar>
  `
})
export class HeaderComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}