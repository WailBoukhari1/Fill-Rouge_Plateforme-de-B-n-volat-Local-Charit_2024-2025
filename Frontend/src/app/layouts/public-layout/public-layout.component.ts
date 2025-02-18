import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <!-- Header -->
    <mat-toolbar class="bg-white border-b">
      <div class="container mx-auto px-4 flex items-center justify-between">
        <!-- Logo -->
        <a routerLink="/" class="flex items-center">
          <mat-icon class="text-primary-600 mr-2">volunteer_activism</mat-icon>
          <span class="text-xl font-bold">Volunteer Hub</span>
        </a>

        <!-- Navigation -->
        <nav class="hidden md:flex items-center space-x-6">
          <a routerLink="/" routerLinkActive="text-primary-600" 
             [routerLinkActiveOptions]="{exact: true}"
             class="text-gray-600 hover:text-primary-600">
            Home
          </a>
          <a routerLink="/events" routerLinkActive="text-primary-600" 
             class="text-gray-600 hover:text-primary-600">
            Events
          </a>
          <a routerLink="/organizations" routerLinkActive="text-primary-600"
             class="text-gray-600 hover:text-primary-600">
            Organizations
          </a>
          <a routerLink="/about" routerLinkActive="text-primary-600"
             class="text-gray-600 hover:text-primary-600">
            About
          </a>
        </nav>

        <!-- Auth Buttons -->
        @if(isLoggedIn()) {
          <button mat-button [matMenuTriggerFor]="userMenu" class="flex items-center">
            <mat-icon class="mr-2">account_circle</mat-icon>
            <span>{{userName}}</span>
            <mat-icon>arrow_drop_down</mat-icon>
          </button>

          <mat-menu #userMenu="matMenu">
            <a mat-menu-item [routerLink]="getDashboardLink()">
              <mat-icon>dashboard</mat-icon>
              <span>Dashboard</span>
            </a>
            <button mat-menu-item (click)="onLogout()">
              <mat-icon>exit_to_app</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        } @else {
          <div class="flex items-center space-x-4">
            <a mat-button routerLink="/auth/login">
              <mat-icon class="mr-2">login</mat-icon>
              Login
            </a>
            <a mat-raised-button color="primary" routerLink="/auth/register">
              <mat-icon class="mr-2">person_add</mat-icon>
              Register
            </a>
          </div>
        }

        <!-- Mobile Menu Button -->
        <button mat-icon-button class="md:hidden" [matMenuTriggerFor]="mobileMenu">
          <mat-icon>menu</mat-icon>
        </button>

        <!-- Mobile Menu -->
        <mat-menu #mobileMenu="matMenu">
          <a mat-menu-item routerLink="/">
            <mat-icon>home</mat-icon>
            <span>Home</span>
          </a>
          <a mat-menu-item routerLink="/events">
            <mat-icon>event</mat-icon>
            <span>Events</span>
          </a>
          <a mat-menu-item routerLink="/organizations">
            <mat-icon>business</mat-icon>
            <span>Organizations</span>
          </a>
          <a mat-menu-item routerLink="/about">
            <mat-icon>info</mat-icon>
            <span>About</span>
          </a>
        </mat-menu>
      </div>
    </mat-toolbar>

    <!-- Main Content -->
    <main class="min-h-[calc(100vh-64px-200px)]">
      <router-outlet></router-outlet>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- About -->
          <div>
            <h3 class="text-lg font-semibold mb-4">About Volunteer Hub</h3>
            <p class="text-gray-400">
              Connecting volunteers with meaningful opportunities to make a difference in their communities.
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
            <ul class="space-y-2">
              <li>
                <a routerLink="/events" class="text-gray-400 hover:text-white">Find Events</a>
              </li>
              <li>
                <a routerLink="/organizations" class="text-gray-400 hover:text-white">Organizations</a>
              </li>
              <li>
                <a routerLink="/about" class="text-gray-400 hover:text-white">About Us</a>
              </li>
              <li>
                <a routerLink="/contact" class="text-gray-400 hover:text-white">Contact</a>
              </li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Contact Us</h3>
            <ul class="space-y-2 text-gray-400">
              <li class="flex items-center">
                <mat-icon class="mr-2">email</mat-icon>
                info&#64;volunteerhub.com
              </li>
              <li class="flex items-center">
                <mat-icon class="mr-2">phone</mat-icon>
                (555) 123-4567
              </li>
              <li class="flex items-center">
                <mat-icon class="mr-2">location_on</mat-icon>
                123 Volunteer St, City
              </li>
            </ul>
          </div>

          <!-- Social -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Follow Us</h3>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-400 hover:text-white">
                <mat-icon>facebook</mat-icon>
              </a>
              <a href="#" class="text-gray-400 hover:text-white">
                <mat-icon>twitter</mat-icon>
              </a>
              <a href="#" class="text-gray-400 hover:text-white">
                <mat-icon>instagram</mat-icon>
              </a>
              <a href="#" class="text-gray-400 hover:text-white">
                <mat-icon>linkedin</mat-icon>
              </a>
            </div>
          </div>
        </div>

        <div class="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {{currentYear}} Volunteer Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .mat-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    main {
      flex: 1;
    }
  `]
})
export class PublicLayoutComponent implements OnInit {
  currentYear = new Date().getFullYear();
  userName: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.isLoggedIn()) {
      this.userName = this.authService.getUserName();
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getDashboardLink(): string {
    return '/dashboard';
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
        // Still navigate to login page even if logout fails
        this.router.navigate(['/auth/login']);
      }
    });
  }
} 