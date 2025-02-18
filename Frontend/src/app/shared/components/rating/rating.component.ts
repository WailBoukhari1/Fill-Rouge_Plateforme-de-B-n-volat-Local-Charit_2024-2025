import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="flex items-center">
      <button type="button"
              *ngFor="let star of stars; let i = index"
              (click)="rate(i + 1)"
              (mouseenter)="hover(i + 1)"
              (mouseleave)="hover(0)"
              class="focus:outline-none">
        <mat-icon [class.text-yellow-400]="(hoverRating || value) > i"
                  [class.text-gray-300]="(hoverRating || value) <= i">
          star
        </mat-icon>
      </button>
    </div>
  `
})
export class RatingComponent {
  @Input() max = 5;
  @Input() value = 0;
  @Output() valueChange = new EventEmitter<number>();

  stars: number[] = [];
  hoverRating = 0;

  ngOnInit() {
    this.stars = Array(this.max).fill(0);
  }

  rate(rating: number): void {
    this.value = rating;
    this.valueChange.emit(rating);
  }

  hover(rating: number): void {
    this.hoverRating = rating;
  }
} 