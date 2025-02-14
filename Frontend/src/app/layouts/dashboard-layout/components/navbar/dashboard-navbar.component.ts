import { Component, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { Observable } from 'rxjs';
import { AuthUser } from '@core/models/auth.model';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../../../store/auth/auth.selectors';
import * as AuthActions from '../../../../store/auth/auth.actions';

@Component({
  selector: 'app-dashboard-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink, 
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule, 
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './dashboard-navbar.component.html',
})
export class DashboardNavbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  
  protected currentUser$: Observable<AuthUser | null>;
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  constructor() {
    this.currentUser$ = this.store.select(selectAuthUser);
  }

  ngOnInit() {}

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
} 