import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cliente } from '../core/cliente/cliente';


@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private baseUrl = `${environment.apiUrl}/clientes`; // 👈 Usar environment
  private http = inject(HttpClient); // 👈 Nombre más corto

  obtenerClienteLista(): Observable<Cliente[]> {
    const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.get<Cliente[]>(this.baseUrl, { headers });
  }
  
  agregarCliente(cliente: Cliente): Observable<Cliente> { // 👈 Tipo específico
    return this.http.post<Cliente>(this.baseUrl, cliente);
  }
  
  obtenerClientePorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${id}`);
  }
  
  editarCliente(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/${id}`, cliente);
  }
  
  eliminarCliente(id: number): Observable<void> { // 👈 void
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
