import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  // Featured events data
  featuredEvents = [
    {
      title: 'Community Clean-up',
      description: 'Join us for a day of community service cleaning up local parks.',
      date: new Date('2024-03-20'),
      location: 'Central Park',
      image: 'assets/images/cleanup.jpg'
    },
    {
      title: 'Food Bank Drive',
      description: 'Help sort and distribute food to those in need in our community.',
      date: new Date('2024-03-25'),
      location: 'Community Center',
      image: 'assets/images/foodbank.jpg'
    },
    {
      title: 'Youth Mentoring',
      description: 'Make a difference in a young person\'s life through mentoring.',
      date: new Date('2024-03-28'),
      location: 'Youth Center',
      image: 'assets/images/mentoring.jpg'
    }
  ];

  // Impact statistics
  statistics = [
    { value: '1000+', label: 'Volunteers' },
    { value: '500+', label: 'Events Completed' },
    { value: '10,000+', label: 'Volunteer Hours' }
  ];
} 