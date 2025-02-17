import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Skill, SkillCategory, SkillEndorsement } from '../models/skill.model';

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  private apiUrl = `${environment.apiUrl}/api/skills`;

  constructor(private http: HttpClient) {}

  getSkills(category?: SkillCategory): Observable<Skill[]> {
    const params = category ? { category } : {};
    return this.http.get<Skill[]>(this.apiUrl, { params });
  }

  getSkill(id: string): Observable<Skill> {
    return this.http.get<Skill>(`${this.apiUrl}/${id}`);
  }

  createSkill(skill: Partial<Skill>): Observable<Skill> {
    return this.http.post<Skill>(this.apiUrl, skill);
  }

  updateSkill(id: string, skill: Partial<Skill>): Observable<Skill> {
    return this.http.put<Skill>(`${this.apiUrl}/${id}`, skill);
  }

  deleteSkill(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  endorseSkill(skillId: string, endorsement: Partial<SkillEndorsement>): Observable<SkillEndorsement> {
    return this.http.post<SkillEndorsement>(`${this.apiUrl}/${skillId}/endorse`, endorsement);
  }

  removeEndorsement(skillId: string, endorsementId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${skillId}/endorse/${endorsementId}`);
  }

  verifySkill(skillId: string): Observable<Skill> {
    return this.http.post<Skill>(`${this.apiUrl}/${skillId}/verify`, {});
  }

  getUserSkills(userId: string): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.apiUrl}/user/${userId}`);
  }

  getPopularSkills(limit: number = 10): Observable<{ skill: Skill; count: number }[]> {
    return this.http.get<{ skill: Skill; count: number }[]>(`${this.apiUrl}/popular`, {
      params: { limit: limit.toString() }
    });
  }
} 