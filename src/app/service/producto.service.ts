import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/api/public`;

  constructor(private http: HttpClient) { }

  getProductos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/productos`);
  }

  getProducto(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/productos/${id}`);
  }

 
    // === AGREGAR ESTE MÉTODO (alias) ===
  obtenerProductoPorId(id: number): Observable<any> {
    return this.getProducto(id);
  }

  // Obtener productos por categoría
  getProductosPorCategoria(categoria: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/productos/categoria/${categoria}`);
  }

  // Agregar producto (solo admin)
  agregarProducto(producto: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${environment.apiUrl}/api/productos`, producto, { headers });
  }

  // Actualizar producto (solo admin)
  actualizarProducto(id: number, producto: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put(`${environment.apiUrl}/api/productos/${id}`, producto, { headers });
  }

  // Eliminar producto (solo admin)
  eliminarProducto(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`${environment.apiUrl}/api/productos/${id}`, { headers });
  }
    editarProducto(id: number, producto: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put(`${environment.apiUrl}/api/productos/${id}`, producto, { headers });
  }
    obtenerProductosLista(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${environment.apiUrl}/api/productos`, { headers });
  }
   private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
   buscarProductos(termino: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/productos/buscar?q=${termino}`);
  }
}