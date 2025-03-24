import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BlockedComponent } from './blocked.component';

const routes: Routes = [
  {
    path: '',
    component: BlockedComponent
  }
];

@NgModule({
  declarations: [BlockedComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class BlockedModule { } 