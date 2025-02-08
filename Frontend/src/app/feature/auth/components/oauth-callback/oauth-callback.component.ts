import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-oauth-callback',
  template: '<div>Processing login...</div>',
  standalone: true
})
export class OAuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const provider = this.route.snapshot.paramMap.get('provider') || 'google';

      if (code) {
        this.authService.handleOAuthCallback(code, provider).subscribe({
          next: () => this.router.navigate(['/events']),
          error: () => this.router.navigate(['/auth/login'])
        });
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }
} 