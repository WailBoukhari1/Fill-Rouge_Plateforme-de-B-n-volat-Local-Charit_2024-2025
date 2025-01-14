import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, AsyncPipe],
  template: `
    <mat-toolbar class="bg-white shadow-sm">
      <div class="container mx-auto px-4 flex items-center justify-between h-16">
        <div class="flex items-center">
          <a routerLink="/" class="text-xl font-bold text-gray-800">
            Volunteering Platform
          </a>
        </div>

        <div class="flex items-center gap-4">
          @if (authService.currentUser$ | async; as user) {
            <button mat-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
              {{ user.name }}
            </button>
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item>Profile</button>
              <button mat-menu-item (click)="authService.logout()">Logout</button>
            </mat-menu>
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
  constructor(public authService: AuthService) {}
} 