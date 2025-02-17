import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Certification, CertificationDocument } from '../models/skill.model';

@Injectable({
  providedIn: 'root'
})
export class CertificationService {
  private apiUrl = `${environment.apiUrl}/api/certifications`;

  constructor(private http: HttpClient) {}

  getCertifications(): Observable<Certification[]> {
    return this.http.get<Certification[]>(this.apiUrl);
  }

  getCertification(id: string): Observable<Certification> {
    return this.http.get<Certification>(`${this.apiUrl}/${id}`);
  }

  createCertification(certification: Partial<Certification>): Observable<Certification> {
    return this.http.post<Certification>(this.apiUrl, certification);
  }

  updateCertification(id: string, certification: Partial<Certification>): Observable<Certification> {
    return this.http.put<Certification>(`${this.apiUrl}/${id}`, certification);
  }

  deleteCertification(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadDocument(certificationId: string, file: File): Observable<HttpEvent<CertificationDocument>> {
    const formData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.apiUrl}/${certificationId}/documents`, formData, {
      reportProgress: true
    });

    return this.http.request(req);
  }

  deleteDocument(certificationId: string, documentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${certificationId}/documents/${documentId}`);
  }

  verifyCertification(id: string): Observable<Certification> {
    return this.http.post<Certification>(`${this.apiUrl}/${id}/verify`, {});
  }

  getUserCertifications(userId: string): Observable<Certification[]> {
    return this.http.get<Certification[]>(`${this.apiUrl}/user/${userId}`);
  }

  getExpiringCertifications(days: number = 30): Observable<Certification[]> {
    return this.http.get<Certification[]>(`${this.apiUrl}/expiring`, {
      params: { days: days.toString() }
    });
  }
} 