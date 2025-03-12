import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Achievement, AchievementType, AchievementCategory } from '../models/achievement.model';

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  private apiUrl = `${environment.apiUrl}/achievements`;

  constructor(private http: HttpClient) {}

  getAchievements(type?: AchievementType, category?: AchievementCategory): Observable<Achievement[]> {
    const params = { ...(type && { type }), ...(category && { category }) };
    return this.http.get<Achievement[]>(this.apiUrl, { params });
  }

  getAchievement(id: string): Observable<Achievement> {
    return this.http.get<Achievement>(`${this.apiUrl}/${id}`);
  }

  createAchievement(achievement: Partial<Achievement>): Observable<Achievement> {
    return this.http.post<Achievement>(this.apiUrl, achievement);
  }

  updateAchievement(id: string, achievement: Partial<Achievement>): Observable<Achievement> {
    return this.http.put<Achievement>(`${this.apiUrl}/${id}`, achievement);
  }

  deleteAchievement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getUserAchievements(userId: string): Observable<Achievement[]> {
    return this.http.get<Achievement[]>(`${this.apiUrl}/user/${userId}`);
  }

  getLeaderboard(category?: AchievementCategory, limit: number = 10): Observable<{ user: any; points: number }[]> {
    const params = { ...(category && { category }), limit: limit.toString() };
    return this.http.get<{ user: any; points: number }[]>(`${this.apiUrl}/leaderboard`, { params });
  }

  trackProgress(achievementId: string, action: string, value: number): Observable<Achievement> {
    return this.http.post<Achievement>(`${this.apiUrl}/${achievementId}/progress`, {
      action,
      value
    });
  }

  claimReward(achievementId: string): Observable<{ success: boolean; reward: any }> {
    return this.http.post<{ success: boolean; reward: any }>(`${this.apiUrl}/${achievementId}/claim`, {});
  }

  getRecentUnlocks(limit: number = 5): Observable<Achievement[]> {
    return this.http.get<Achievement[]>(`${this.apiUrl}/recent-unlocks`, {
      params: { limit: limit.toString() }
    });
  }
} 