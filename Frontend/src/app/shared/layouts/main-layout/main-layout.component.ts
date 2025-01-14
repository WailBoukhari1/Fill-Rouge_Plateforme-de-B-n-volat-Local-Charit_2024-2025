import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { SidenavComponent } from '../../components/sidenav/sidenav.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, SidenavComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <app-header />
      
      <div class="flex-1 flex">
        <app-sidenav class="hidden md:block w-64 bg-white shadow-sm" />
        
        <main class="flex-1 p-6">
          <router-outlet />
        </main>
      </div>
      
      <app-footer />
    </div>
  `
})
export class MainLayoutComponent {} 