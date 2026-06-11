// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 1. Definir qué rutas son públicas y no deben llevar el token
    // Esto evita enviar tokens expirados o innecesarios a endpoints abiertos
    const esRutaPublica = req.url.includes('/api/public/') || 
                           req.url.includes('/api/productos/');

    // Si es ruta pública, pasamos la petición tal cual sin tocarla
    if (esRutaPublica) {
        return next.handle(req);
    }

    // 2. Si no es pública, procedemos a añadir el token
    const token = this.authService.getToken();
    
    console.log('🔄 Interceptor - URL Protegida:', req.url);
    
    let authReq = req;
    if (token) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      console.log('✅ Token añadido a:', req.url);
    }
      
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          console.warn('⚠️ Sesión expirada o no autorizada');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}