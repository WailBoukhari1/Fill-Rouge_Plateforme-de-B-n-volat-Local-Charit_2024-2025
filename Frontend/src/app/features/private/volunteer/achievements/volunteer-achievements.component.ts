import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  VolunteerService,
  Achievement,
  Badge,
} from '../../../../core/services/volunteer.service';

@Component({
  selector: 'app-volunteer-achievements',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  template: `<div class="container mx-auto p-4">
    <!-- Loading State -->
    <div *ngIf="loading" class="text-center py-8">
      <mat-spinner diameter="40" class="mx-auto"></mat-spinner>
      <p class="mt-4 text-gray-600">Loading achievements...</p>
    </div>

    <!-- Error State -->
    <div *ngIf="error" class="text-center py-8 text-red-600">
      {{ error }}
    </div>

    <!-- Content -->
    <div *ngIf="!loading && !error">
      <!-- Achievements Section -->
      <h2 class="text-2xl font-bold mb-4">Achievements</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <mat-card
          *ngFor="let achievement of achievements"
          class="achievement-card"
        >
          <mat-card-content class="p-4">
            <div class="flex items-center mb-4">
              <mat-icon class="text-4xl mr-4 text-primary-500">{{
                achievement.icon || 'emoji_events'
              }}</mat-icon>
              <div>
                <h3 class="text-lg font-semibold">{{ achievement.name }}</h3>
                <p class="text-sm text-gray-600">
                  {{ achievement.description }}
                </p>
              </div>
            </div>
            <div class="text-sm text-gray-500">
              Earned on {{ achievement.earnedDate | date }}
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Badges Section -->
      <h2 class="text-2xl font-bold mb-4">Badges</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <mat-card *ngFor="let badge of badges" class="badge-card">
          <mat-card-content class="p-4">
            <div class="flex items-center mb-4">
              <div class="w-16 h-16 mr-4">
                <img
                  [src]="badge.imageUrl"
                  [alt]="badge.name"
                  class="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 class="text-lg font-semibold">{{ badge.name }}</h3>
                <p class="text-sm text-gray-600">{{ badge.description }}</p>
              </div>
            </div>
            <div class="mb-2">
              <div class="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span
                  >{{ badge.currentPoints }}/{{ badge.requiredPoints }}</span
                >
              </div>
              <mat-progress-bar
                [value]="(badge.currentPoints / badge.requiredPoints) * 100"
                [matTooltip]="getProgressTooltip(badge)"
                class="mb-2"
              >
              </mat-progress-bar>
            </div>
            <div class="text-sm text-gray-500">
              Level:
              <span [class]="getBadgeLevelClass(badge.level || '')">{{
                badge.level
              }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  </div>`,
  styleUrls: ['./volunteer-achievements.component.scss'],
})
export class VolunteerAchievementsComponent implements OnInit {
  achievements: Achievement[] = [];
  badges: Badge[] = [];
  loading = false;
  error: string | null = null;

  constructor(private volunteerService: VolunteerService) {}

  ngOnInit(): void {
    this.loading = true;
    this.loadAchievements();
    this.loadBadges();
  }

  private loadAchievements(): void {
    this.volunteerService.getAchievements().subscribe({
      next: (achievements: Achievement[]) => {
        this.achievements = achievements;
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Error loading achievements:', error);
        this.error = 'Failed to load achievements';
        this.loading = false;
      },
    });
  }

  private loadBadges(): void {
    this.volunteerService.getBadges().subscribe({
      next: (badges: Badge[]) => {
        this.badges = badges;
      },
      error: (error: Error) => {
        console.error('Error loading badges:', error);
        this.error = 'Failed to load badges';
      },
    });
  }

  getBadgeLevelClass(level: string): string {
    switch (level.toLowerCase()) {
      case 'bronze':
        return 'bronze-badge';
      case 'silver':
        return 'silver-badge';
      case 'gold':
        return 'gold-badge';
      case 'platinum':
        return 'platinum-badge';
      default:
        return '';
    }
  }

  getProgressTooltip(badge: Badge): string {
    const remaining = badge.requiredPoints - badge.currentPoints;
    return `${remaining} points needed for next level`;
  }
}
