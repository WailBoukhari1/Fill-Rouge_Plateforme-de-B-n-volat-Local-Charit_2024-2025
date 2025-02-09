import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <footer class="bg-gray-100">
      <div class="container mx-auto px-4 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Brand -->
          <div class="col-span-1">
            <div class="flex items-center space-x-2 mb-4">
              <mat-icon class="text-primary-600">volunteer_activism</mat-icon>
              <span class="font-bold text-xl">VolunteerHub</span>
            </div>
            <p class="text-gray-600">
              Connecting volunteers with meaningful opportunities to make a difference.
            </p>
          </div>

          <!-- Quick Links -->
          <div class="col-span-1">
            <h3 class="font-semibold text-lg mb-4">Quick Links</h3>
            <ul class="space-y-2">
              <li><a routerLink="/events" class="text-gray-600 hover:text-primary-600">Events</a></li>
              <li><a routerLink="/organizations" class="text-gray-600 hover:text-primary-600">Organizations</a></li>
              <li><a routerLink="/volunteer" class="text-gray-600 hover:text-primary-600">Volunteer</a></li>
            </ul>
          </div>

          <!-- Support -->
          <div class="col-span-1">
            <h3 class="font-semibold text-lg mb-4">Support</h3>
            <ul class="space-y-2">
              <li><a href="#" class="text-gray-600 hover:text-primary-600">Help Center</a></li>
              <li><a href="#" class="text-gray-600 hover:text-primary-600">Contact Us</a></li>
              <li><a href="#" class="text-gray-600 hover:text-primary-600">Privacy Policy</a></li>
            </ul>
          </div>

          <!-- Social -->
          <div class="col-span-1">
            <h3 class="font-semibold text-lg mb-4">Follow Us</h3>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-600 hover:text-primary-600">
                <mat-icon>facebook</mat-icon>
              </a>
              <a href="#" class="text-gray-600 hover:text-primary-600">
                <mat-icon>twitter</mat-icon>
              </a>
              <a href="#" class="text-gray-600 hover:text-primary-600">
                <mat-icon>instagram</mat-icon>
              </a>
            </div>
          </div>
        </div>

        <div class="border-t mt-8 pt-8 text-center text-gray-600">
          <p>&copy; 2024 VolunteerHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {} 