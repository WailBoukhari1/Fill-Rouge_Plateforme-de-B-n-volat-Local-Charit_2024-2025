import { Routes } from '@angular/router';

export const PUBLIC_VOLUNTEER_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/volunteer-list/volunteer-list.component')
          .then(m => m.VolunteerListComponent),
        title: 'Volunteers'
      },
      {
        path: ':id',
        loadComponent: () => import('./components/volunteer-profile/volunteer-profile.component')
          .then(m => m.VolunteerProfileComponent),
        title: 'Volunteer Profile'
      }
    ]
  }
];

export const DASHBOARD_VOLUNTEER_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        loadComponent: () => import('./components/volunteer-management/volunteer-list.component')
          .then(m => m.VolunteerListComponent),
        title: 'All Volunteers'
      },
      {
        path: 'stats',
        loadComponent: () => import('./components/volunteer-management/volunteer-stats.component')
          .then(m => m.VolunteerStatsComponent),
        title: 'Volunteer Statistics'
      },
      {
        path: 'registrations',
        loadComponent: () => import('./components/volunteer-management/registrations.component')
          .then(m => m.RegistrationsComponent),
        title: 'Volunteer Registrations'
      },
      {
        path: 'history',
        loadComponent: () => import('./components/volunteer-management/participation-history.component')
          .then(m => m.ParticipationHistoryComponent),
        title: 'Participation History'
      },
      {
        path: 'profile',
        children: [
          {
            path: '',
            loadComponent: () => import('./components/volunteer-profile/volunteer-profile.component')
              .then(m => m.VolunteerProfileComponent),
            title: 'My Profile'
          },
          {
            path: 'skills',
            loadComponent: () => import('./components/volunteer-profile/skills-availability.component')
              .then(m => m.SkillsAvailabilityComponent),
            title: 'Skills & Availability'
          }
        ]
      },
      {
        path: 'achievements',
        loadComponent: () => import('./components/volunteer-profile/achievements.component')
          .then(m => m.AchievementsComponent),
        title: 'My Achievements'
      }
    ]
  }
]; 