import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { VolunteerProfile } from '../models/volunteer-profile.model';
import { VolunteerService } from '../services/volunteer.service';

@Injectable({
  providedIn: 'root'
})
export class VolunteerResolver implements Resolve<VolunteerProfile> {
  // TODO: Implement volunteer resolver
} 