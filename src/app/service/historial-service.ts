import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HistorialService {
  private apiUrl = `${environment.apiUrl}/api/historial`;
  private http = inject(HttpClient);

  private getToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') {
      return null;
    }
    return token;
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return token ? headers.set('Authorization', `Bearer ${token}`) : headers;
  }

  registrarVisita(productoId: number): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return of(null);
    }

    return this.http.post(`${this.apiUrl}/visita/${productoId}`, {}, {
      headers: this.getHeaders()
    });
  }

  getUltimosVisitados(limit: number = 4): Observable<any[]> {
    const token = this.getToken();
    if (!token) {
      return of([]);
    }

    return this.http.get<any[]>(`${this.apiUrl}/ultimos`, {
      headers: this.getHeaders(),
      params: { limit: String(limit) }
    });
  }

  getHistorialCompleto(): Observable<any[]> {
    const token = this.getToken();
    if (!token) {
      return of([]);
    }

    return this.http.get<any[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  getRecomendaciones(): Observable<any[]> {
    const token = this.getToken();
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      return of([]);
    }

    return this.http.get<any[]>(`${environment.apiUrl}/api/dashboard/recomendaciones/${userId}`, {
      headers: this.getHeaders()
    });
  }
}