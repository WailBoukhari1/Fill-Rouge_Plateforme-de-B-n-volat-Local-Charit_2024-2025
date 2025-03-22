import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';

export const VOLUNTEER_ROUTES: Routes = [
  // Temporarily commented out due to missing components
  /* {
    path: 'register',
    loadComponent: () => import('./volunteer-registration/volunteer-registration.component').then(m => m.VolunteerRegistrationComponent),
    data: { title: 'Volunteer Registration - Local Charity', animation: 'volunteerRegPage' }
  },
  {
    path: 'questionnaire',
    loadComponent: () => import('./volunteer-questionnaire/volunteer-questionnaire.component').then(m => m.VolunteerQuestionnaireComponent),
    canActivate: [AuthGuard],
    data: { title: 'Volunteer Questionnaire - Local Charity', animation: 'volunteerQuestionnairePage' }
  } */
]; 