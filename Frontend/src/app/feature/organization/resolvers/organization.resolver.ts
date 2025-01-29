import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Organization } from '../../../core/models/organization.model';
import { OrganizationService } from '../services/organization.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizationResolver implements Resolve<Organization> {
  // TODO: Implement organization resolver
} 