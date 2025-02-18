import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VolunteerService } from '../../../../core/services/volunteer.service';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  dateEarned: Date;
  category: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: string;
  progress: number;
  requiredPoints: number;
  currentPoints: number;
}

@Component({
  selector: 'app-volunteer-achievements',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <!-- Achievements Section -->
      <h2 class="text-2xl font-bold mb-4">Achievements</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        @for (achievement of achievements; track achievement.id) {
          <mat-card class="achievement-card">
            <mat-card-content class="p-4">
              <div class="flex items-center mb-4">
                <mat-icon class="text-4xl mr-4 text-primary-500">{{achievement.icon}}</mat-icon>
                <div>
                  <h3 class="text-lg font-semibold">{{achievement.name}}</h3>
                  <p class="text-sm text-gray-600">{{achievement.description}}</p>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                Earned on {{achievement.dateEarned | date}}
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <!-- Badges Section -->
      <h2 class="text-2xl font-bold mb-4">Badges</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (badge of badges; track badge.id) {
          <mat-card class="badge-card">
            <mat-card-content class="p-4">
              <div class="flex items-center mb-4">
                <mat-icon class="text-4xl mr-4" [ngClass]="getBadgeLevelClass(badge.level)">
                  {{badge.icon}}
                </mat-icon>
                <div>
                  <h3 class="text-lg font-semibold">{{badge.name}}</h3>
                  <p class="text-sm text-gray-600">{{badge.description}}</p>
                </div>
              </div>
              <div class="mb-2">
                <div class="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{{badge.currentPoints}}/{{badge.requiredPoints}}</span>
                </div>
                <mat-progress-bar
                  [value]="(badge.currentPoints / badge.requiredPoints) * 100"
                  [matTooltip]="getProgressTooltip(badge)"
                  class="mb-2">
                </mat-progress-bar>
              </div>
              <div class="text-sm text-gray-500">
                Level: {{badge.level}}
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .achievement-card, .badge-card {
      height: 100%;
    }
    .bronze-badge {
      color: #CD7F32;
    }
    .silver-badge {
      color: #C0C0C0;
    }
    .gold-badge {
      color: #FFD700;
    }
    .platinum-badge {
      color: #E5E4E2;
    }
  `]
})
export class VolunteerAchievementsComponent implements OnInit {
  achievements: Achievement[] = [];
  badges: Badge[] = [];

  constructor(private volunteerService: VolunteerService) {}

  ngOnInit(): void {
    this.loadAchievements();
    this.loadBadges();
  }

  loadAchievements(): void {
    this.volunteerService.getAchievements().subscribe({
      next: (achievements) => this.achievements = achievements,
      error: (error) => console.error('Error loading achievements:', error)
    });
  }

  loadBadges(): void {
    this.volunteerService.getBadges().subscribe({
      next: (badges) => this.badges = badges,
      error: (error) => console.error('Error loading badges:', error)
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