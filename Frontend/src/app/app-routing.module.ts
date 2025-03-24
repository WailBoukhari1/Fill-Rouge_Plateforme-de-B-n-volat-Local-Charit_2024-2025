import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'blocked',
    loadChildren: () => import('./pages/blocked/blocked.module').then(m => m.BlockedModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule)
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule)
  },
  // Add other routes as needed
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 