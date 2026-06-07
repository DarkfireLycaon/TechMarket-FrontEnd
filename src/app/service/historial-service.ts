import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HistorialService {
  private apiUrl = 'http://localhost:8080/api/historial';
  private http = inject(HttpClient);

  // Registrar visita (llámalo desde el componente de detalle de producto)
  registrarVisita(productoId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/visita/${productoId}`, {});
  }

  // Obtener los 3 últimos (para el slider)
  getUltimosVisitados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ultimos`);
  }

  // Obtener recomendaciones basadas en lo visitado
  getRecomendaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recomendaciones`);
  }
}