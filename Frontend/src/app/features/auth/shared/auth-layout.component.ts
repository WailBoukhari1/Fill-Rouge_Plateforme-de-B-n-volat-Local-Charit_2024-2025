import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {{ title }}
          </h2>
          <p *ngIf="subtitle" class="mt-2 text-center text-sm text-gray-600">
            {{ subtitle }}
          </p>
        </div>

        <mat-card>
          <mat-card-content>
            <ng-content></ng-content>
          </mat-card-content>
        </mat-card>

        <div class="text-center">
          <ng-content select="[footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AuthLayoutComponent {
  @Input() title!: string;
  @Input() subtitle?: string;
} 