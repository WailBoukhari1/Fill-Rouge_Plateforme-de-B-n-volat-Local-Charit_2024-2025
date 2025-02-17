import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Store } from '@ngrx/store';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatButtonModule, MatToolbarModule],
  template: `
        <router-outlet />
  `
})
export class AppComponent implements OnInit {
  constructor(
    private store: Store,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check and restore auth state from localStorage
    this.authService.checkAuthState();
  }
}
