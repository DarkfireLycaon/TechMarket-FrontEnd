import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HistorialService {
 private apiUrl = `${environment.apiUrl}/api/historial`;
  private http = inject(HttpClient);

  // Registrar visita (llámalo desde el componente de detalle de producto)
  registrarVisita(productoId: number): Observable<any> {
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);// Asegúrate de que esta es la clave correcta
    return this.http.post(`${this.apiUrl}/visita/${productoId}`, {});
  }

  // Obtener los 3 últimos (para el slider)
  getUltimosVisitados(): Observable<any[]> {
    const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/ultimos`);
  }

  // Obtener recomendaciones basadas en lo visitado
  getRecomendaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recomendaciones`);
  }
}