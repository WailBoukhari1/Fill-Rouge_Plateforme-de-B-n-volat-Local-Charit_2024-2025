import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { MainLayoutComponent } from '../../shared/layouts/main-layout/main-layout.component';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  standalone: true,
  imports: [CommonModule, MainLayoutComponent]
})
export class TestComponent implements OnInit {
  user: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.loadStoredUser();
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }
} 