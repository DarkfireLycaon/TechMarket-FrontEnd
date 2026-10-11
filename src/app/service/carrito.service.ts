import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of, Subject, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProductoService } from './producto.service';

interface LineaCarritoInvitado {
  productoId: number;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private apiUrl = `${environment.apiUrl}/api/carrito`;
  private readonly guestCartKey = 'techmarket_guest_cart_v1';
  private productoService = inject(ProductoService);
  private carritoActualizadoSource = new Subject<void>();
  carritoActualizado$ = this.carritoActualizadoSource.asObservable();
  
  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return token ? headers.set('Authorization', `Bearer ${token}`) : headers;
  }

  obtenerCarrito(): Observable<any> {
    if (!this.getToken()) return this.obtenerCarritoInvitado();

    return this.sincronizarCarritoInvitado().pipe(
      switchMap(() => this.http.get(this.apiUrl, { headers: this.getHeaders() })),
      tap((response: any) => console.log('Carrito obtenido:', response)),
      catchError((error) => this.handleError(error))
    );
  }

  private obtenerCarritoInvitado(): Observable<any> {
    const lineas = this.leerCarritoInvitado();
    if (!lineas.length) return of({ items: [], total: 0 });

    return this.productoService.getProductos().pipe(
      map((respuesta: any) => Array.isArray(respuesta) ? respuesta : (respuesta?.content ?? [])),
      map((productos: any[]) => {
        const items = lineas.flatMap((linea) => {
          const producto = productos.find((item) => Number(item.idProducto ?? item.id) === linea.productoId);
          if (!producto) return [];
          const precioUnitario = producto.esOferta && Number(producto.precioOferta) > 0
            ? Number(producto.precioOferta)
            : Number(producto.precioVenta ?? producto.precio ?? 0);
          return [{
            productoId: linea.productoId,
            producto,
            cantidad: linea.cantidad,
            precioUnitario,
            subtotal: precioUnitario * linea.cantidad
          }];
        });
        return { items, total: items.reduce((total, item) => total + item.subtotal, 0) };
      }),
      catchError((error) => this.handleError(error))
    );
  }

  private leerCarritoInvitado(): LineaCarritoInvitado[] {
    try {
      const guardado = JSON.parse(localStorage.getItem(this.guestCartKey) || '[]');
      if (!Array.isArray(guardado)) return [];
      return guardado
        .map((linea: any) => ({ productoId: Number(linea.productoId), cantidad: Number(linea.cantidad) }))
        .filter((linea: LineaCarritoInvitado) => linea.productoId > 0 && linea.cantidad > 0);
    } catch {
      return [];
    }
  }

  private guardarCarritoInvitado(lineas: LineaCarritoInvitado[]): void {
    localStorage.setItem(this.guestCartKey, JSON.stringify(lineas));
    this.carritoActualizadoSource.next();
  }

  sincronizarCarritoInvitado(): Observable<void> {
    if (!this.getToken()) return of(void 0);
    const lineas = this.leerCarritoInvitado();
    if (!lineas.length) return of(void 0);

    return forkJoin(lineas.map((linea) => this.http.post(`${this.apiUrl}/agregar`, {
      productoId: linea.productoId,
      cantidad: linea.cantidad
    }, { headers: this.getHeaders() }))).pipe(
      tap(() => {
        localStorage.removeItem(this.guestCartKey);
        this.carritoActualizadoSource.next();
      }),
      map(() => void 0),
      catchError((error) => this.handleError(error))
    );
  }

  agregarProducto(productoId: number, cantidad: number): Observable<any> {
    if (!this.getToken()) {
      const lineas = this.leerCarritoInvitado();
      const existente = lineas.find((linea) => linea.productoId === Number(productoId));
      if (existente) existente.cantidad += cantidad;
      else lineas.push({ productoId: Number(productoId), cantidad });
      this.guardarCarritoInvitado(lineas);
      return of({ invitado: true });
    }

    return this.sincronizarCarritoInvitado().pipe(
      switchMap(() => this.http.post(`${this.apiUrl}/agregar`, { productoId, cantidad }, { headers: this.getHeaders() })),
      tap(() => this.carritoActualizadoSource.next()),
      catchError((error) => this.handleError(error))
    );
  }

  eliminarProducto(productoId: number): Observable<any> {
    if (!this.getToken()) {
      this.guardarCarritoInvitado(this.leerCarritoInvitado().filter((linea) => linea.productoId !== Number(productoId)));
      return of({ invitado: true });
    }

    return this.sincronizarCarritoInvitado().pipe(
      switchMap(() => this.http.delete(`${this.apiUrl}/eliminar/${productoId}`, { headers: this.getHeaders() })),
      tap(() => this.carritoActualizadoSource.next()),
      catchError((error) => this.handleError(error))
    );
  }

  actualizarCantidad(productoId: number, cantidad: number): Observable<any> {
    if (!this.getToken()) {
      const lineas = this.leerCarritoInvitado();
      const actualizadas = cantidad < 1
        ? lineas.filter((linea) => linea.productoId !== Number(productoId))
        : lineas.map((linea) => linea.productoId === Number(productoId) ? { ...linea, cantidad } : linea);
      this.guardarCarritoInvitado(actualizadas);
      return of({ invitado: true });
    }

    return this.sincronizarCarritoInvitado().pipe(
      switchMap(() => this.http.put(`${this.apiUrl}/actualizar/${productoId}`, { cantidad }, { headers: this.getHeaders() })),
      tap(() => this.carritoActualizadoSource.next()),
      catchError((error) => this.handleError(error))
    );
  }

  vaciarCarrito(): Observable<any> {
    if (!this.getToken()) {
      localStorage.removeItem(this.guestCartKey);
      this.carritoActualizadoSource.next();
      return of({ invitado: true });
    }

    return this.sincronizarCarritoInvitado().pipe(
      switchMap(() => this.http.delete(`${this.apiUrl}/vaciar`, { headers: this.getHeaders() })),
      tap(() => this.carritoActualizadoSource.next()),
      catchError((error) => this.handleError(error))
    );
  }

  private getToken(): string | null {
    const token = localStorage.getItem('token');
    return token && token !== 'null' && token !== 'undefined' ? token : null;
  }

  private handleError(error: any): Observable<never> {
    console.error('Error detallado:', error);
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
      if (error.error?.mensaje) errorMessage = error.error.mensaje;
      else if (error.error?.error) errorMessage = error.error.error;
    }
    console.error('Mensaje de error procesado:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}