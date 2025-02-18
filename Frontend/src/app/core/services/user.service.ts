import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  getUsers(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(this.apiUrl, { params });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  getUserStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  lockUserAccount(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/lock`, {});
  }

  unlockUserAccount(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/unlock`, {});
  }

  resendVerificationEmail(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/resend-verification`, { email });
  }
} 
 