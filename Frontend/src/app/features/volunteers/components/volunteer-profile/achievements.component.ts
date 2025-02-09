import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">My Achievements</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <mat-card *ngFor="let achievement of achievements">
          <mat-card-header>
            <mat-icon mat-card-avatar>{{achievement.icon}}</mat-icon>
            <mat-card-title>{{achievement.title}}</mat-card-title>
            <mat-card-subtitle>{{achievement.date | date}}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{achievement.description}}</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `
})
export class AchievementsComponent {
  achievements = [
    {
      icon: 'star',
      title: 'First Event',
      description: 'Completed your first volunteer event',
      date: new Date('2024-01-01')
    },
    {
      icon: 'groups',
      title: 'Team Player',
      description: 'Participated in 5 group events',
      date: new Date('2024-02-15')
    }
  ];
} 