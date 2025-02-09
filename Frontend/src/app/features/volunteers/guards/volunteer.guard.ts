import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class VolunteerGuard implements CanActivate {
  // TODO: Implement volunteer guard
} 