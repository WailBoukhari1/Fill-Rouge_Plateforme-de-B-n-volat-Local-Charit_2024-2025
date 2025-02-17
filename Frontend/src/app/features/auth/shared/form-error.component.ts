import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="error" class="text-red-500 text-sm text-center mt-2">
      {{ error }}
    </div>
  `
})
export class FormErrorComponent {
  @Input() error?: string | null;
} 