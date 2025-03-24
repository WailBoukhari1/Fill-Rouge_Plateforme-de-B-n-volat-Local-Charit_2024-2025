import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blocked',
  template: `
    <div class="blocked-container">
      <div class="blocked-content">
        <h1>Account Blocked</h1>
        <div class="icon">
          <i class="fas fa-ban"></i>
        </div>
        <p>Your account has been blocked. Please contact support for assistance.</p>
        <button (click)="logout()" class="btn btn-danger">Logout</button>
      </div>
    </div>
  `,
  styles: [`
    .blocked-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f8f9fa;
    }
    .blocked-content {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
      max-width: 400px;
      width: 90%;
    }
    .icon {
      font-size: 4rem;
      color: #dc3545;
      margin: 1rem 0;
    }
    h1 {
      color: #dc3545;
      margin-bottom: 1rem;
    }
    p {
      color: #6c757d;
      margin-bottom: 2rem;
    }
    .btn-danger {
      background-color: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .btn-danger:hover {
      background-color: #c82333;
    }
  `]
})
export class BlockedComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // Check if user is actually blocked
    const userStatus = localStorage.getItem('userStatus');
    if (userStatus !== 'BLOCKED') {
      this.router.navigate(['/']);
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
} 