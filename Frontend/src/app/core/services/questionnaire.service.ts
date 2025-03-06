import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Submit the questionnaire data to the backend
   * @param formData The questionnaire form data
   * @returns Observable with the API response
   */
  submitQuestionnaire(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/questionnaire`, formData);
  }

  /**
   * Check if the user has completed the questionnaire
   * @returns Observable with the API response
   */
  checkQuestionnaireStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/questionnaire/status`);
  }
}
