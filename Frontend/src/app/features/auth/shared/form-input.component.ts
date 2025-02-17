import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mb-4">
      <label [for]="name" class="block text-sm font-medium text-gray-700 mb-1">
        {{ label }}
      </label>
      <input
        [type]="type"
        [id]="name"
        [formControlName]="name"
        [formGroup]="form"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        [placeholder]="placeholder"
      />
      <div
        *ngIf="form.get(name)?.touched && form.get(name)?.errors as errors"
        class="text-red-500 text-sm mt-1"
      >
        <div *ngIf="errors['required']">{{ label }} is required</div>
        <div *ngIf="errors['email']">Please enter a valid email</div>
        <div *ngIf="errors['minlength']">
          {{ label }} must be at least {{ errors['minlength'].requiredLength }} characters
        </div>
      </div>
    </div>
  `
})
export class FormInputComponent {
  @Input() form!: FormGroup;
  @Input() name!: string;
  @Input() label!: string;
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
} 