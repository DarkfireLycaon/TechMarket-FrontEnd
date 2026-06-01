import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Venta } from './venta/venta';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class VentaService {
  
  // Opción 1: Usar inject (recomendado para standalone)
  private http = inject(HttpClient);
  
  // Opción 2: Usar constructor (comenta la de arriba si prefieres esta)
  // constructor(private http: HttpClient) { }
  
  private baseUrl = `${environment.apiUrl}/ventas`; // 👈 URL BASE CONSISTENTE

  listarVentas(): Observable<Venta[]> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.get<Venta[]>(this.baseUrl, { headers });
  }
  
  agregarVenta(venta: Venta): Observable<Venta> { // 👈 Mejor devolver el objeto creado
    console.log('📤 Agregando venta:', venta);
    return this.http.post<Venta>(this.baseUrl, venta);
  }
  
  obtenerVenta(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.baseUrl}/${id}`);
  }
  
  actualizarVenta(id: number, venta: Venta): Observable<Venta> {
    return this.http.put<Venta>(`${this.baseUrl}/${id}`, venta);
  }
  
  eliminarVenta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
