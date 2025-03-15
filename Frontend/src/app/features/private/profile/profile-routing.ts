import { Routes } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { VolunteerProfileComponent } from '../volunteer/volunteer-profile/volunteer-profile.component';
import { OrganizationProfileComponent } from '../organization/profile/organization-profile.component';
import { RoleGuard } from '../../../core/guards/role.guard';

export const profileRoutes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    children: [
      {
        path: '',
        redirectTo: 'volunteer',
        pathMatch: 'full',
      },
      {
        path: 'volunteer',
        component: VolunteerProfileComponent,
        canActivate: [RoleGuard],
        data: { roles: ['VOLUNTEER'] },
      },
      {
        path: 'organization',
        component: OrganizationProfileComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ORGANIZATION'] },
      },
    ],
  },
];
