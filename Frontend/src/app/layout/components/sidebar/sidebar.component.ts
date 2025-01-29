import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, MatSidenavModule, MatListModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  // TODO: Implement sidebar component
} 