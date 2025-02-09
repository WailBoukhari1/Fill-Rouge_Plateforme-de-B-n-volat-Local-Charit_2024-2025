import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { OrganizationService } from '../services/organization.service';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizationOwnerGuard implements CanActivate {
  // TODO: Implement organization owner guard
} 