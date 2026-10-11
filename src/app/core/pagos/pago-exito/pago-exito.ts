import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <-- Importado ChangeDetectorRef
import { CommonModule } from '@angular/common'; // Asegúrate de tenerlo si usas standalone
import { ActivatedRoute, Router } from '@angular/router';
import { PedidoService } from '../../../service/pedido.service';

@Component({
  selector: 'app-pago-exito',
  standalone: true, // Si tu componente es Standalone, recuerda habilitar esta línea
  imports: [CommonModule], // Si es Standalone, necesita CommonModule para usar el *ngIf
  template: `
    <div style="text-align: center; margin-top: 50px;">
      <h2>{{ mensaje }}</h2>
      <p *ngIf="cargando">Confirmando el pago, por favor espera...</p>
      <button *ngIf="!cargando" (click)="irALaTienda()" class="btn btn-primary" style="margin-top: 20px; padding: 10px 20px;">Volver a la tienda</button>
    </div>
  `
})
export class PagoExito implements OnInit {
  cargando = true;
  mensaje = 'Verificando pago...';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoService: PedidoService,
    private cdr: ChangeDetectorRef // <-- Inyectado correctamente en el constructor
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const stripeSessionId = params['session_id'] || params['sessionId'];
      if (stripeSessionId) {
        this.cargando = false;
        this.mensaje = 'Pago recibido. Estamos confirmando tu pedido.';
        this.cdr.detectChanges();
        return;
      }

      const token = params['token'];
      const pedidoId = +params['pedidoId'];

      if (token && pedidoId) {
        this.confirmarPago(token, pedidoId);
      } else {
        this.cargando = false;
        this.mensaje = 'Error: Faltan parámetros de pago válidos.';
        this.cdr.detectChanges(); // ✅ Forzamos a mostrar el mensaje de error inmediatamente si la URL está incompleta
      }
    });
  }

  confirmarPago(token: string, pedidoId: number): void {
    this.pedidoService.capturarPagoPaypal(token, pedidoId).subscribe({
      next: (response) => {
        this.cargando = false;
        this.mensaje = '¡Pago completado con éxito! Tu pedido ha sido procesado.';
        console.log(response?.mensaje || 'Pago verificado correctamente');
        
        this.cdr.detectChanges(); // ✅ EXTREMADAMENTE CRÍTICO: Fuerza a Angular a ocultar el spinner y pintar el botón de éxito
      },
      error: (err) => {
        this.cargando = false;
        this.mensaje = 'Hubo un problema al confirmar el pago en nuestro sistema.';
        console.error(err);
        
        this.cdr.detectChanges(); // ✅ CRÍTICO: Si la API de Spring Boot responde un error, desbloqueamos la pantalla y pintamos el texto de fallo
      }
    });
  }

  irALaTienda(): void {
    this.router.navigate(['/dashboard']);
  }
}