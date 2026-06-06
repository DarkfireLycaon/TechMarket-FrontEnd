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
      <p *ngIf="cargando">Procesando tu pago en los servidores de PayPal, por favor no cierres la ventana...</p>
      <button *ngIf="!cargando" (click)="irAMisPedidos()" class="btn btn-primary" style="margin-top: 20px; padding: 10px 20px;">Ver mis pedidos</button>
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
    // Capturamos los parámetros que PayPal inyecta en la URL
    this.route.queryParams.subscribe(params => {
      const token = params['token']; // ID de la orden de PayPal
      const pedidoId = +params['pedidoId']; // ID de nuestro pedido en base de datos

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

  irAMisPedidos(): void {
    this.router.navigate(['/mis-pedidos']); // Redirige a su panel
  }
}