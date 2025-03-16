import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';

export const VOLUNTEER_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./volunteer-profile/volunteer-profile.component').then(m => m.VolunteerProfileComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'profile/edit',
        loadComponent: () => import('./volunteer-profile/edit/edit-profile.component').then(m => m.EditProfileComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'events',
        loadComponent: () => import('./events/volunteer-events.component').then(m => m.VolunteerEventsComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'hours',
        loadComponent: () => import('./hours/volunteer-hours.component').then(m => m.VolunteerHoursComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'achievements',
        loadComponent: () => import('./achievements/volunteer-achievements.component').then(m => m.VolunteerAchievementsComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'waitlist',
        loadComponent: () => import('./waitlist/volunteer-waitlist.component').then(m => m.VolunteerWaitlistComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'feedback/:eventId',
        loadComponent: () => import('./feedback/volunteer-feedback.component').then(m => m.VolunteerFeedbackComponent),
        canActivate: [AuthGuard]
      }
    ]
  }
]; 