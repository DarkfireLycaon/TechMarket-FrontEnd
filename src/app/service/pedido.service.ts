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

  crearPedido(pedido: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, pedido, { headers: this.getHeaders() });
  }

// En tu servicio de pedidos, asegúrate de tener algo parecido a esto:
obtenerMisPedidos(): Observable<any> {
  const token = localStorage.getItem('token'); // O donde guardes tu token
  
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // ¡Esto es lo que hace que Spring te reconozca!
  });

 return this.http.get(`${this.apiUrl}/mis-pedidos`, { headers: this.getHeaders() });
}

  obtenerPedido(pedidoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${pedidoId}`, { headers: this.getHeaders() });
  }

  cancelarPedido(pedidoId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/cancelar/${pedidoId}`, {}, { headers: this.getHeaders() });
  }

iniciarPagoPaypal(pedidoId: number): Observable<string> { // <-- Cambiamos el tipo a Observable<string>
    return this.http.post(`${this.apiUrl}/${pedidoId}/pagar-paypal`, null, { 
      headers: this.getHeaders(),
      responseType: 'text' // <-- CORRECTO: Angular sabe perfectamente que recibirá texto plano sin romper nada
    });
  }

  capturarPagoPaypal(token: string, pedidoId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/capturar-paypal`, { token, pedidoId }, { headers: this.getHeaders() });
  }
}