import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = `${environment.apiUrl}/api/pedidos`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ========== MÉTODOS DE CLIENTE ==========

  crearPedido(pedido: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, pedido, { headers: this.getHeaders() });
  }

  obtenerMisPedidos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mis-pedidos`, { headers: this.getHeaders() });
  }

  obtenerPedido(pedidoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${pedidoId}`, { headers: this.getHeaders() });
  }

  cancelarPedido(pedidoId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/cancelar/${pedidoId}`, {}, { headers: this.getHeaders() });
  }

  // ========== MÉTODOS DE ADMINISTRADOR (NUEVOS) ==========

  obtenerTodosPedidosAdmin(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/todos`, { headers: this.getHeaders() });
  }

  actualizarEstadoAdmin(pedidoId: number, estado: string): Observable<any> {
    // Enviamos el objeto { estado } porque tu controlador espera un Map<String, String>
    return this.http.put<any>(
      `${this.apiUrl}/admin/estado/${pedidoId}`, 
      { estado }, 
      { headers: this.getHeaders() }
    );
  }

  obtenerPedidosPorEstadoAdmin(estado: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/estado/${estado}`, { headers: this.getHeaders() });
  }

  // ========== PASARELA PAYPAL ==========

  iniciarPagoPaypal(pedidoId: number): Observable<string> {
    return this.http.post(`${this.apiUrl}/${pedidoId}/pagar-paypal`, null, { 
      headers: this.getHeaders(),
      responseType: 'text' 
    });
  }

  capturarPagoPaypal(token: string, pedidoId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/capturar-paypal`, { token, pedidoId }, { headers: this.getHeaders() });
  }
  // ======== ADMIN =============================//
  obtenerResumenDashboard(): Observable<any> {
  return this.http.get('http://localhost:8080/api/admin/dashboard/resumen');
}
}