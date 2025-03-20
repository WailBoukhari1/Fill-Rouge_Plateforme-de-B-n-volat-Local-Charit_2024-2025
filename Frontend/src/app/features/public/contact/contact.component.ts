import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <!-- Hero Section -->
    <section class="bg-primary-50 py-20">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Contact Us
          </h1>
          <p class="text-xl text-gray-600">
            Have questions? We're here to help.
          </p>
        </div>
      </div>
    </section>

    <!-- Contact Form Section -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <!-- Contact Information -->
            <div>
              <h2 class="text-2xl font-bold mb-6">Get in Touch</h2>
              <div class="space-y-6">
                <div class="flex items-start">
                  <mat-icon class="text-primary-500 mr-4">location_on</mat-icon>
                  <div>
                    <h3 class="font-semibold">Address</h3>
                    <p class="text-gray-600">123 Volunteer Street<br>City, State 12345</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <mat-icon class="text-primary-500 mr-4">email</mat-icon>
                  <div>
                    <h3 class="font-semibold">Email</h3>
                    <p class="text-gray-600">infovolunteerhub.com</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <mat-icon class="text-primary-500 mr-4">phone</mat-icon>
                  <div>
                    <h3 class="font-semibold">Phone</h3>
                    <p class="text-gray-600">(555) 123-4567</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact Form -->
            <div>
              <h2 class="text-2xl font-bold mb-6">Send us a Message</h2>
              <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-4">
                <mat-form-field class="w-full">
                  <mat-label>Name</mat-label>
                  <input matInput formControlName="name" placeholder="Your name">
                  <mat-error *ngIf="contactForm.get('name')?.hasError('required')">
                    Name is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field class="w-full">
                  <mat-label>Email</mat-label>
                  <input matInput formControlName="email" placeholder="Your email">
                  <mat-error *ngIf="contactForm.get('email')?.hasError('required')">
                    Email is required
                  </mat-error>
                  <mat-error *ngIf="contactForm.get('email')?.hasError('email')">
                    Please enter a valid email
                  </mat-error>
                </mat-form-field>

                <mat-form-field class="w-full">
                  <mat-label>Subject</mat-label>
                  <input matInput formControlName="subject" placeholder="Message subject">
                  <mat-error *ngIf="contactForm.get('subject')?.hasError('required')">
                    Subject is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field class="w-full">
                  <mat-label>Message</mat-label>
                  <textarea matInput formControlName="message" rows="4" 
                            placeholder="Your message"></textarea>
                  <mat-error *ngIf="contactForm.get('message')?.hasError('required')">
                    Message is required
                  </mat-error>
                </mat-form-field>

                <button mat-raised-button color="primary" type="submit" 
                        [disabled]="contactForm.invalid || isSubmitting"
                        class="w-full">
                  <mat-icon class="mr-2">send</mat-icon>
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ContactComponent {
  contactForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      // TODO: Implement contact form submission
      console.log('Form submitted:', this.contactForm.value);
      
      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        this.snackBar.open('Message sent successfully!', 'Close', {
          duration: 3000
        });
        this.contactForm.reset();
      }, 1000);
    }
  }
} 