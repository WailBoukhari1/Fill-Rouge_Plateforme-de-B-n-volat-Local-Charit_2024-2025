import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink, 
    RouterLinkActive, 
    MatButtonModule, 
    MatToolbarModule, 
    MatIconModule, 
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  protected authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();

    window.location.href = '/';

  }
} 