import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, Subject, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private apiUrl = `${environment.apiUrl}/api/carrito`;
  private carritoActualizadoSource = new Subject<void>();
  carritoActualizado$ = this.carritoActualizadoSource.asObservable();
  
  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No hay token de autenticación');
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Obtener carrito
  obtenerCarrito(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(this.apiUrl, { headers }).pipe(
      tap((response: any) => console.log('Carrito obtenido:', response)),
      catchError(this.handleError)
    );
  }

 // Agregar producto al carrito
  agregarProducto(productoId: number, cantidad: number): Observable<any> {
    const headers = this.getHeaders();
    const body = { productoId, cantidad };
    
    return this.http.post(`${this.apiUrl}/agregar`, body, { headers }).pipe(
      // 🔥 AVISAMOS A TODOS LOS SUSCRIPTORES QUE EL CARRITO CAMBIÓ
      tap(() => this.carritoActualizadoSource.next()), 
      tap(response => console.log('Respuesta del servidor:', response)),
      catchError(this.handleError)
    );
  }

 // Eliminar producto del carrito
  eliminarProducto(productoId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/eliminar/${productoId}`, { headers }).pipe(
      // 🔥 AVISAMOS TAMBIÉN AQUÍ
      tap(() => this.carritoActualizadoSource.next()),
      tap(response => console.log('Producto eliminado:', response)),
      catchError(this.handleError)
    );
  }

  // Actualizar cantidad
  actualizarCantidad(productoId: number, cantidad: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/actualizar/${productoId}`, { cantidad }, { headers }).pipe(
      tap(response => console.log('Cantidad actualizada:', response)),
      catchError(this.handleError)
    );
  }

// Vaciar carrito
  vaciarCarrito(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/vaciar`, { headers }).pipe(
      // 🔥 AVISAMOS TAMBIÉN AQUÍ
      tap(() => this.carritoActualizadoSource.next()),
      tap(response => console.log('Carrito vaciado:', response)),
      catchError(this.handleError)
    );
  }

  // Manejo de errores
  private handleError(error: any): Observable<never> {
    console.error('Error detallado:', error);
    
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
      
      // Si el servidor devuelve un mensaje de error personalizado
      if (error.error && error.error.mensaje) {
        errorMessage = error.error.mensaje;
      } else if (error.error && error.error.error) {
        errorMessage = error.error.error;
      }
    }
    
    console.error('Mensaje de error procesado:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}