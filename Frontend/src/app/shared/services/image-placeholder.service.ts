import { Injectable } from '@angular/core';

/**
 * Service for handling placeholder images throughout the application
 */
@Injectable({
  providedIn: 'root'
})
export class ImagePlaceholderService {
  // SVG placeholders as base64 data URLs
  private organizationPlaceholder: string = '';
  private userPlaceholder: string = '';
  private eventPlaceholder: string = '';

  constructor() {
    this.initPlaceholders();
  }

  /**
   * Initialize the placeholder images
   */
  private initPlaceholders(): void {
    // Organization placeholder
    const orgSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#f0f0f0"/>
        <text x="100" y="100" font-family="Arial" font-size="16" fill="#555" text-anchor="middle" alignment-baseline="middle">Organization</text>
        <path d="M100 50 C 120 50, 140 70, 140 90 C 140 110, 120 130, 100 130 C 80 130, 60 110, 60 90 C 60 70, 80 50, 100 50 Z" fill="#42a5f5" fill-opacity="0.3" stroke="#42a5f5" stroke-width="2"/>
        <rect x="70" y="140" width="60" height="30" rx="5" fill="#42a5f5" fill-opacity="0.3" stroke="#42a5f5" stroke-width="2"/>
      </svg>
    `;
    this.organizationPlaceholder = `data:image/svg+xml;base64,${btoa(orgSvg.trim())}`;

    // User placeholder
    const userSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#f0f0f0"/>
        <circle cx="100" cy="75" r="40" fill="#9c27b0" fill-opacity="0.3" stroke="#9c27b0" stroke-width="2"/>
        <circle cx="100" cy="190" r="80" fill="#9c27b0" fill-opacity="0.3" stroke="#9c27b0" stroke-width="2"/>
      </svg>
    `;
    this.userPlaceholder = `data:image/svg+xml;base64,${btoa(userSvg.trim())}`;

    // Event placeholder
    const eventSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#f0f0f0"/>
        <text x="100" y="100" font-family="Arial" font-size="16" fill="#555" text-anchor="middle" alignment-baseline="middle">Event</text>
        <rect x="50" y="50" width="100" height="90" rx="5" fill="#4caf50" fill-opacity="0.3" stroke="#4caf50" stroke-width="2"/>
        <line x1="50" y1="70" x2="150" y2="70" stroke="#4caf50" stroke-width="2"/>
        <circle cx="70" cy="60" r="5" fill="#4caf50"/>
        <circle cx="130" cy="60" r="5" fill="#4caf50"/>
      </svg>
    `;
    this.eventPlaceholder = `data:image/svg+xml;base64,${btoa(eventSvg.trim())}`;
  }

  /**
   * Get the organization placeholder image URL
   */
  getOrganizationPlaceholder(): string {
    return this.organizationPlaceholder;
  }

  /**
   * Get the user placeholder image URL
   */
  getUserPlaceholder(): string {
    return this.userPlaceholder;
  }

  /**
   * Get the event placeholder image URL
   */
  getEventPlaceholder(): string {
    return this.eventPlaceholder;
  }

  /**
   * Safely get an image URL, using a placeholder if the original URL is undefined or empty
   * @param url The original image URL
   * @param type The type of placeholder to use ('organization', 'user', or 'event')
   */
  getImageUrl(url: string | undefined, type: 'organization' | 'user' | 'event'): string {
    if (!url) {
      switch (type) {
        case 'organization':
          return this.getOrganizationPlaceholder();
        case 'user':
          return this.getUserPlaceholder();
        case 'event':
          return this.getEventPlaceholder();
        default:
          return this.getOrganizationPlaceholder();
      }
    }
    return url;
  }
} 