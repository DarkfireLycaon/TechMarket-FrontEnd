import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class wishlistService {
  private apiUrl = `${environment.apiUrl}/api/wishlist`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private normalizarItem(item: any): any {
    const producto = item?.producto ?? {};
    const idProducto = item?.idProducto ?? item?.productId ?? item?.id ?? producto?.idProducto ?? producto?.id ?? null;
    const nombre = item?.nombre ?? item?.productoNombre ?? producto?.nombre ?? producto?.productoNombre ?? 'Producto';
    const precioVenta = item?.precioVenta ?? item?.precio ?? producto?.precioVenta ?? producto?.precio ?? 0;
    const imagenUrl = item?.imagenUrl ?? item?.imagen ?? producto?.imagenUrl ?? producto?.imagen ?? '';

    return {
      ...item,
      id: item?.id ?? idProducto,
      productId: item?.productId ?? idProducto,
      idProducto,
      producto: {
        ...producto,
        idProducto,
        nombre,
        precioVenta,
        imagenUrl
      },
      nombre,
      precio: precioVenta,
      precioVenta,
      imagenUrl,
      imagen: imagenUrl
    };
  }

  getWishlist(): Observable<any[]> {
    if (!localStorage.getItem('token')) return of([]);
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(this.apiUrl, { headers }).pipe(
      map((items) => Array.isArray(items) ? items.map(item => this.normalizarItem(item)) : [])
    );
  }

  addToWishlist(productId: number) {
    const headers = this.getAuthHeaders();
    const payloads = [
      { productoId: productId, productId, idProducto: productId },
      { productId, idProducto: productId },
      { productoId: productId },
      { idProducto: productId }
    ];

    const endpoints = [
      `${this.apiUrl}/agregar`,
      this.apiUrl,
      `${this.apiUrl}/${productId}`
    ];

    return this.http.post(endpoints[0], payloads[0], { headers }).pipe(
      catchError(() => this.http.post(endpoints[1], payloads[1], { headers }).pipe(
        catchError(() => this.http.post(endpoints[2], payloads[2], { headers }).pipe(
          catchError(() => this.http.post(endpoints[1], payloads[3], { headers }))
        ))
      ))
    );
  }

  removeFromWishlist(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }
}