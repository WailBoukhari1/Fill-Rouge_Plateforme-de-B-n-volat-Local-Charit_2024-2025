import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Event } from '../../store/event/event.state';
import { selectAllEvents } from '../../store/event/event.selectors';

@Injectable({
  providedIn: 'root'
})
export class EventAnalyticsService {
  constructor(private store: Store) {}

  getEventStatistics(): Observable<{
    totalEvents: number;
    activeEvents: number;
    completedEvents: number;
    totalParticipants: number;
    totalVolunteerHours: number;
    averageRating: number;
  }> {
    return this.store.select(selectAllEvents).pipe(
      map(events => {
        const now = new Date();
        const activeEvents = events.filter(event => 
          new Date(event.startDate) <= now && new Date(event.endDate) >= now
        );
        const completedEvents = events.filter(event => 
          new Date(event.endDate) < now
        );

        return {
          totalEvents: events.length,
          activeEvents: activeEvents.length,
          completedEvents: completedEvents.length,
          totalParticipants: this.calculateTotalParticipants(events),
          totalVolunteerHours: this.calculateTotalVolunteerHours(events),
          averageRating: this.calculateAverageRating(events)
        };
      })
    );
  }

  getCategoryDistribution(): Observable<{ [category: string]: number }> {
    return this.store.select(selectAllEvents).pipe(
      map(events => {
        const distribution: { [category: string]: number } = {};
        events.forEach(event => {
          distribution[event.category] = (distribution[event.category] || 0) + 1;
        });
        return distribution;
      })
    );
  }

  getParticipationTrends(): Observable<{
    daily: { date: string; count: number }[];
    weekly: { week: string; count: number }[];
    monthly: { month: string; count: number }[];
  }> {
    return this.store.select(selectAllEvents).pipe(
      map(events => {
        const daily: { [date: string]: number } = {};
        const weekly: { [week: string]: number } = {};
        const monthly: { [month: string]: number } = {};

        events.forEach(event => {
          const date = new Date(event.startDate);
          const dateStr = date.toISOString().split('T')[0];
          const weekStr = this.getWeekNumber(date);
          const monthStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

          daily[dateStr] = (daily[dateStr] || 0) + event.currentParticipants;
          weekly[weekStr] = (weekly[weekStr] || 0) + event.currentParticipants;
          monthly[monthStr] = (monthly[monthStr] || 0) + event.currentParticipants;
        });

        return {
          daily: Object.entries(daily).map(([date, count]) => ({ date, count })),
          weekly: Object.entries(weekly).map(([week, count]) => ({ week, count })),
          monthly: Object.entries(monthly).map(([month, count]) => ({ month, count }))
        };
      })
    );
  }

  getSkillsDistribution(): Observable<{ skill: string; count: number }[]> {
    return this.store.select(selectAllEvents).pipe(
      map(events => {
        const skillsCount: { [skill: string]: number } = {};
        events.forEach(event => {
          event.requiredSkills.forEach(skill => {
            skillsCount[skill] = (skillsCount[skill] || 0) + 1;
          });
        });
        return Object.entries(skillsCount)
          .map(([skill, count]) => ({ skill, count }))
          .sort((a, b) => b.count - a.count);
      })
    );
  }

  getLocationHeatmap(): Observable<{ location: string; eventCount: number }[]> {
    return this.store.select(selectAllEvents).pipe(
      map(events => {
        const locationCount: { [location: string]: number } = {};
        events
          .filter(event => !event.isVirtual)
          .forEach(event => {
            locationCount[event.location] = (locationCount[event.location] || 0) + 1;
          });
        return Object.entries(locationCount)
          .map(([location, eventCount]) => ({ location, eventCount }))
          .sort((a, b) => b.eventCount - a.eventCount);
      })
    );
  }

  private calculateTotalParticipants(events: Event[]): number {
    return events.reduce((total, event) => total + event.currentParticipants, 0);
  }

  private calculateTotalVolunteerHours(events: Event[]): number {
    return events.reduce((total, event) => total + (event.durationHours * event.currentParticipants), 0);
  }

  private calculateAverageRating(events: Event[]): number {
    const ratedEvents = events.filter(event => event.numberOfRatings > 0);
    if (ratedEvents.length === 0) return 0;
    
    const totalRating = ratedEvents.reduce((sum, event) => sum + event.rating, 0);
    return totalRating / ratedEvents.length;
  }

  private getWeekNumber(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
  }
} 