import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Event } from '../../models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="event-detail-container" *ngIf="event">
      <!-- Hero Section -->
      <div class="hero-section" [style.backgroundImage]="event ? 'url(' + event.imageUrl + ')' : ''">
        <div class="hero-content">
          <h1>{{event?.title}}</h1>
          <div class="event-meta">
            <span class="date">
              <i class="fas fa-calendar"></i> {{event?.date | date:'longDate'}}
            </span>
            <span class="location">
              <i class="fas fa-map-marker-alt"></i> {{event?.location}}
            </span>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <div class="content-grid">
          <!-- Left Column -->
          <div class="details-section">
            <h2>About This Event</h2>
            <p class="description">{{event?.description}}</p>

            <div class="info-card">
              <h3>Event Details</h3>
              <ul>
                <li>
                  <i class="fas fa-clock"></i>
                  <span>Time: {{event?.time}}</span>
                </li>
                <li>
                  <i class="fas fa-users"></i>
                  <span>Capacity: {{event?.capacity}} volunteers needed</span>
                </li>
                <li>
                  <i class="fas fa-tag"></i>
                  <span>Category: {{event?.category}}</span>
                </li>
              </ul>
            </div>

            <div class="organizer-section">
              <h3>Organizer</h3>
              <div class="organizer-info">
                <img [src]="event?.organizerImage" alt="Organizer" class="organizer-image">
                <div class="organizer-details">
                  <h4>{{event?.organizerName}}</h4>
                  <p>{{event?.organizerDescription}}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="action-section">
            <div class="action-card">
              <h3>Join This Event</h3>
              <p class="spots-left">{{event?.spotsLeft}} spots remaining</p>
              <button class="primary-button" (click)="registerForEvent()" [disabled]="!event?.spotsLeft">
                Register as Volunteer
              </button>
              <div class="share-buttons">
                <button class="share-button">
                  <i class="fas fa-share-alt"></i> Share
                </button>
                <button class="save-button" (click)="toggleSave()">
                  <i class="fas" [class.fa-bookmark]="isSaved" [class.fa-bookmark-o]="!isSaved"></i>
                  {{isSaved ? 'Saved' : 'Save'}}
                </button>
              </div>
            </div>

            <div class="location-card">
              <h3>Location</h3>
              <div class="map-container">
                <!-- Map integration placeholder -->
                <div class="map-placeholder"></div>
              </div>
              <p class="address">{{event?.fullAddress}}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .event-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0;
    }

    .hero-section {
      height: 400px;
      background-size: cover;
      background-position: center;
      position: relative;
      border-radius: 0 0 20px 20px;
      overflow: hidden;
    }

    .hero-content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 2rem;
      background: linear-gradient(transparent, rgba(0,0,0,0.8));
      color: white;
    }

    .hero-content h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .event-meta {
      display: flex;
      gap: 1.5rem;
      font-size: 1.1rem;
    }

    .event-meta i {
      margin-right: 0.5rem;
    }

    .main-content {
      padding: 2rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
      margin-top: 2rem;
    }

    .details-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .info-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 1.5rem 0;
    }

    .info-card ul {
      list-style: none;
      padding: 0;
    }

    .info-card li {
      display: flex;
      align-items: center;
      margin: 1rem 0;
    }

    .info-card i {
      margin-right: 1rem;
      color: #4a90e2;
    }

    .organizer-section {
      margin-top: 2rem;
    }

    .organizer-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 1rem;
    }

    .organizer-image {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
    }

    .action-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .action-card, .location-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .primary-button {
      width: 100%;
      padding: 1rem;
      background: #4a90e2;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      cursor: pointer;
      transition: background 0.3s;
    }

    .primary-button:hover {
      background: #357abd;
    }

    .primary-button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .share-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .share-button, .save-button {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      transition: all 0.3s;
    }

    .share-button:hover, .save-button:hover {
      background: #f8f9fa;
    }

    .map-container {
      height: 200px;
      background: #f8f9fa;
      border-radius: 8px;
      margin: 1rem 0;
    }

    .spots-left {
      color: #28a745;
      font-weight: 600;
      text-align: center;
      margin: 1rem 0;
    }

    @media (max-width: 768px) {
      .content-grid {
        grid-template-columns: 1fr;
      }

      .hero-section {
        height: 300px;
      }

      .hero-content h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  isSaved: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const eventId = params['id'];
      if (eventId) {
        this.eventService.getEventById(eventId).subscribe(
          event => this.event = event
        );
      }
    });
  }

  registerForEvent(): void {
    if (this.event) {
      // TODO: Implement registration logic
      console.log('Registering for event:', this.event.id);
    }
  }

  toggleSave(): void {
    this.isSaved = !this.isSaved;
    // TODO: Implement save logic
  }
}
