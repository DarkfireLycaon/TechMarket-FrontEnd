import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Proveedor } from '../core/proveedor/proveedor';


@Injectable({
  providedIn: 'root',
})
export class ProveedorService {
    
    private http = inject(HttpClient); // 👈 Nombre consistente (clienteHttp → http)
    
    // 👈 Usar environment en lugar de URL hardcodeada
    private baseUrl = `${environment.apiUrl}/proveedores`;
    
    constructor() { // 👈 Constructor vacío (opcional)
        console.log('ProveedorService inicializado con URL:', this.baseUrl);
    }
    
    // 📋 Obtener todos los proveedores
    obtenerProveedorLista(): Observable<Proveedor[]> {
        const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.get<Proveedor[]>(this.baseUrl, { headers });
    }
    
    // ➕ Agregar nuevo proveedor
    agregarProveedor(proveedor: Proveedor): Observable<Proveedor> { // 👈 Tipo específico
        console.log('📤 Agregando proveedor:', proveedor);
        return this.http.post<Proveedor>(this.baseUrl, proveedor);
    }
    
    // 🔍 Obtener proveedor por ID
    obtenerProveedorPorId(id: number): Observable<Proveedor> {
        console.log(`📤 Obteniendo proveedor con ID: ${id}`);
        return this.http.get<Proveedor>(`${this.baseUrl}/${id}`);
    }
    
    // ✏️ Editar proveedor existente
    editarProveedor(id: number, proveedor: Proveedor): Observable<Proveedor> {
        console.log(`📤 Editando proveedor ${id}:`, proveedor);
        return this.http.put<Proveedor>(`${this.baseUrl}/${id}`, proveedor);
    }
    
    // 🗑️ Eliminar proveedor
    eliminarProveedor(id: number): Observable<void> { // 👈 void es más apropiado que Object
        console.log(`📤 Eliminando proveedor con ID: ${id}`);
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}
