import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-white shadow-sm mt-auto">
      <div class="container mx-auto px-4 py-4">
        <div class="text-center text-gray-600">
          © {{ currentYear }} Volunteering Platform. All rights reserved.
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
} 