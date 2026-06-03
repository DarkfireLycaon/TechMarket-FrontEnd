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

  obtenerMisPedidos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mis-pedidos`, { headers: this.getHeaders() });
  }

  obtenerPedido(pedidoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${pedidoId}`, { headers: this.getHeaders() });
  }

  cancelarPedido(pedidoId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/cancelar/${pedidoId}`, {}, { headers: this.getHeaders() });
  }
}