import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { ImagePlaceholderService } from '../../services/image-placeholder.service';

@Component({
  selector: 'app-event-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <div class="p-6 max-w-3xl">
      <div class="flex justify-between items-start mb-4">
        <h2 class="text-2xl font-bold">{{ data.title }}</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <div class="mb-6">
        <img [src]="getEventImageUrl(data)" alt="{{ data.title }}" 
          class="w-full h-48 object-cover rounded-lg mb-4">
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p class="text-gray-500 mb-1">Organization</p>
          <p class="font-medium">{{ data.organizationName }}</p>
        </div>
        <div>
          <p class="text-gray-500 mb-1">Status</p>
          <mat-chip [color]="getStatusColor(data.status)" [ngClass]="getStatusClass(data.status)">
            {{ data.status }}
          </mat-chip>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p class="text-gray-500 mb-1">Start Date</p>
          <p class="font-medium">{{ data.startDate | date:'medium' }}</p>
        </div>
        <div>
          <p class="text-gray-500 mb-1">End Date</p>
          <p class="font-medium">{{ data.endDate | date:'medium' }}</p>
        </div>
      </div>
      
      <mat-divider class="my-4"></mat-divider>
      
      <div class="mb-4">
        <p class="text-gray-500 mb-1">Location</p>
        <p class="font-medium">{{ data.location || 'Not specified' }}</p>
      </div>
      
      <div class="mb-4">
        <p class="text-gray-500 mb-1">Description</p>
        <p>{{ data.description }}</p>
      </div>
      
      <div *ngIf="data.categories?.length > 0" class="mb-4">
        <p class="text-gray-500 mb-1">Categories</p>
        <div class="flex flex-wrap gap-2">
          <mat-chip *ngFor="let category of data.categories">
            {{ category.name }}
          </mat-chip>
        </div>
      </div>
      
      <div *ngIf="data.skills?.length > 0" class="mb-4">
        <p class="text-gray-500 mb-1">Skills Required</p>
        <div class="flex flex-wrap gap-2">
          <mat-chip *ngFor="let skill of data.skills">
            {{ skill.name }}
          </mat-chip>
        </div>
      </div>
      
      <div class="flex justify-end mt-4">
        <button mat-button (click)="close()">Close</button>
      </div>
    </div>
  `
})
export class EventDetailsDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EventDetailsDialogComponent>,
    private imagePlaceholderService: ImagePlaceholderService
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  getEventImageUrl(event: any): string {
    if (event && event.imageUrl) {
      return event.imageUrl;
    }
    if (event && (event as any).image) {
      return (event as any).image;
    }
    return this.imagePlaceholderService.getEventPlaceholder();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'primary';
      case 'PENDING':
        return 'accent';
      case 'REJECTED':
      case 'CANCELLED':
        return 'warn';
      default:
        return '';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return '';
    }
  }
} 