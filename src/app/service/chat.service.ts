import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Necesario para usar .pipe(map(...))

// 1. Definimos la interfaz fuera de la clase
export interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = '${environment.apiUrl}/chatbot'; // Asegúrate de que esta URL sea la correcta

  constructor(private http: HttpClient) {}

enviarMensaje(texto: string): Observable<any> {
  const palabrasClave = texto.toLowerCase()
    .replace(/[¿?¡!]/g, '') 
    .replace(/\b(tienen|stock|de|la|el|los|las|una|un|remar|remeras|productos|consulta|comparar|vs|diferencia entre)\b/g, '')
    .trim();

  return this.http.get(`${this.apiUrl}/consulta`, { 
    params: { nombre: palabrasClave }, 
    responseType: 'text' 
  }).pipe(
    map(respuesta => {
      try {
        // Intentamos convertir a JSON. Si es una comparativa, funcionará.
        return JSON.parse(respuesta);
      } catch (e) {
        // Si falla, es un mensaje de texto normal (stock, etc.), lo devolvemos igual.
        return respuesta;
      }
    })
  );
}
}