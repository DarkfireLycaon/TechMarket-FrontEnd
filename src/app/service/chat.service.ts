import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = `${environment.apiUrl}/api/chatbot`;

  constructor(private http: HttpClient) {}

  analizarIntencion(texto: string): 'stock' | 'precio' | 'comparacion' | 'recomendacion' | 'ofertas' | 'general' {
    const consulta = texto.toLowerCase();

    if (/(stock|disponible|hay|tienen|inventario|existe)/.test(consulta)) return 'stock';
    if (/(precio|cuanto cuesta|valor|costo|precio de)/.test(consulta)) return 'precio';
    if (/(comparar|vs|diferencia|mejor entre|compa)/.test(consulta)) return 'comparacion';
    if (/(recomienda|recomendacion|quiero algo|para|ideal para)/.test(consulta)) return 'recomendacion';
    if (/(oferta|ofertas|descuento|promo|rebaja)/.test(consulta)) return 'ofertas';
    return 'general';
  }

  enviarMensaje(texto: string): Observable<any> {
    const consulta = texto
      .trim()
      .replace(/[¿?¡!.,;]/g, '')
      .replace(/\b(quiero|necesito|ayuda|podrias|puedes|dime|saber|sobre|de|la|el|los|las|un|una|por|mi|me|tengo|consulta|producto|productos|comparar|vs|diferencia entre)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const pregunta = consulta || texto.trim();

    return this.http.get(`${this.apiUrl}/consulta`, {
      params: {
        pregunta,
        nombre: pregunta
      },
      responseType: 'text'
    }).pipe(
      map((respuesta) => {
        try {
          return JSON.parse(respuesta);
        } catch (e) {
          return respuesta;
        }
      })
    );
  }
}