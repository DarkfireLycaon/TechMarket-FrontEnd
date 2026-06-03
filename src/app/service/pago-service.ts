import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private apiUrl = `${environment.apiUrl}/api/pagos`;
  private stripe: Stripe | null = null;
  private publishableKey = 'pk_test_xxxxxxxxxxxxx'; // Tu Publishable Key

  constructor(private http: HttpClient) {
    this.initStripe();
  }

  private async initStripe() {
    this.stripe = await loadStripe(this.publishableKey);
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  crearIntencionPago(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear-intencion`, datos, { headers: this.getHeaders() });
  }

  async procesarPago(pedidoId: number, cantidad: number, email: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        // 1. Crear intención de pago en el backend
        this.crearIntencionPago({ pedidoId, cantidad, email }).subscribe(async (response) => {
          if (response.success && this.stripe) {
            // 2. Confirmar el pago con Stripe
            const result = await this.stripe!.confirmPayment({
              clientSecret: response.clientSecret,
              confirmParams: {
                return_url: `${window.location.origin}/pedido-confirmado`,
              }
            });
            
            if (result.error) {
              reject(result.error);
            } else {
              resolve(result);
            }
          } else {
            reject(new Error(response.mensaje || 'Error al crear intención de pago'));
          }
        }, (error) => reject(error));
      } catch (error) {
        reject(error);
      }
    });
  }
}