import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule],
  template: `
    <nav class="p-4 h-full">
      <mat-nav-list>
        <a mat-list-item routerLink="/app/dashboard" routerLinkActive="bg-gray-100">
          <mat-icon matListItemIcon>dashboard</mat-icon>
          <span matListItemTitle>Dashboard</span>
        </a>
        
        <a mat-list-item routerLink="/app/opportunities" routerLinkActive="bg-gray-100">
          <mat-icon matListItemIcon>volunteer_activism</mat-icon>
          <span matListItemTitle>Opportunities</span>
        </a>
        
        <a mat-list-item routerLink="/app/profile" routerLinkActive="bg-gray-100">
          <mat-icon matListItemIcon>person</mat-icon>
          <span matListItemTitle>Profile</span>
        </a>
      </mat-nav-list>
    </nav>
  `
})
export class SidenavComponent {} 