import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard  {
  constructor(private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const token = localStorage.getItem('token');
    const userStatus = localStorage.getItem('userStatus');

    if (!token) {
      return this.router.createUrlTree(['/login']);
    }

    if (userStatus === 'BLOCKED') {
      return this.router.createUrlTree(['/blocked']);
    }

    return true;
  }
} 