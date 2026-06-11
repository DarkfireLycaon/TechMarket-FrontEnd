import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  // 1. Creamos un Signal para el usuario completo (inicializado con lo que haya en localStorage)
  private currentUser = signal<any>(this.obtenerUsuarioDeLocalStorage());

  constructor(public http: HttpClient) { }

  private obtenerUsuarioDeLocalStorage(): any {
    try {
      return JSON.parse(localStorage.getItem('usuario') || 'null');
    } catch {
      return null;
    }
  }

  login(creds: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, creds).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          
          // MODIFICADO: Guardamos las propiedades exactas que devuelve el HashMap de Spring Boot
          const usuario = {
            email: creds.email,
            nombre: res.nombre || creds.email.split('@')[0],
            isAdmin: !!res.isAdmin // Mapea el booleano directo del backend
          };
          
          localStorage.setItem('usuario', JSON.stringify(usuario));
          
          // Actualizamos el Signal (esto activa el @if en tus templates instantáneamente)
          this.currentUser.set(usuario);
        }
      })
    );
  }

  // MODIFICADO: Ahora valida directamente el atributo booleano de forma reactiva
  isAdmin(): boolean {
    const usuario = this.currentUser();
    if (!usuario) return false;
    return usuario.isAdmin === true;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    
    // Vaciamos el Signal al cerrar sesión
    this.currentUser.set(null);
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    if (token && token !== 'null' && token !== '') {
      return token;
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  registrar(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrar`, usuario);
  }

  enviarEnlaceRecuperacion(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/olvide-password`, { email });
  }

  resetearPassword(token: string, nuevaPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { 
      token: token, 
      nuevaPassword: nuevaPassword 
    });
  }

  obtenerPerfil(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.apiUrl}/perfil`, { headers });
  }

  actualizarPerfil(datosUsuario: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    return this.http.put(`${this.apiUrl}/perfil`, datosUsuario, { headers }).pipe(
      tap((usuarioActualizado: any) => {
        if (usuarioActualizado) {
          const cached = this.obtenerUsuarioDeLocalStorage() || {};
          // El operador spread (...) mantiene las propiedades viejas (como isAdmin) si el perfil no las devuelve
          const nuevoEstado = { ...cached, ...usuarioActualizado };
          localStorage.setItem('usuario', JSON.stringify(nuevoEstado));
          this.currentUser.set(nuevoEstado);
        }
      })
    );
  }
}