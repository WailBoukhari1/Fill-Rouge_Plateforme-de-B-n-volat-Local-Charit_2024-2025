import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthService } from '../../../components/auth/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      @if (authService.currentUser$ | async) {
        <app-header />
        <div class="flex-1 flex">
          <main class="flex-1 p-6">
            <router-outlet />
          </main>
        </div>
      } @else {
        <main class="flex-1">
          <router-outlet />
        </main>
      }
      <app-footer />
    </div>
  `
})
export class MainLayoutComponent {
  constructor(public authService: AuthService) {}
} 