import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Event } from '../../../core/models/event.model';
import { EventService } from '../services/event.service';

@Injectable({
  providedIn: 'root'
})
export class EventResolver implements Resolve<Event> {
  // TODO: Implement event resolver
} 