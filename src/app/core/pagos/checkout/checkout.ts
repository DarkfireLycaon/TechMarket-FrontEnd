import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PedidoService } from '../../../service/pedido.service'; 
import { AuthService } from '../../../service/auth'; // <--- Inyectamos tu AuthService

@Component({
  selector: 'app-checkout',
  standalone: true, 
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class Checkout implements OnInit {
  
  loading: boolean = false;
  procesando: boolean = false;

  // Modelo ligado a los inputs del formulario mediante [(ngModel)]
  cliente = {
    nombre: '',
    email: '',
    telefono: '',
    codigoPostal: '',
    direccion: '',
    ciudad: '',
    notas: '' // Ajustado en base a tu propiedad 'notas' o 'notes'
  };

  metodosPago = [
    { valor: 'mercadoPago', nombre: 'Mercado Pago', icono: 'fab fa-mercadopago' },
    { valor: 'paypal', nombre: 'PayPal (Euros)', icono: 'fab fa-paypal text-info' },
    { valor: 'efectivo', nombre: 'Efectivo al recibir', icono: 'fas fa-money-bill' }
  ];

  metodoPago: string = 'paypal';

  carrito = {
    items: [
      { cantidad: 1, producto: { nombre: 'Producto de prueba' }, subtotal: 100 }
    ]
  };

  constructor(
    private pedidoService: PedidoService,
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef // <-- Inyectado correctamente
  ) { }

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  // Trae los datos guardados en la BD y llena el formulario automáticamente
  cargarDatosUsuario(): void {
    this.loading = true;
    this.cdr.detectChanges(); // Forzamos mostrar el spinner de carga inicial

    this.authService.obtenerPerfil().subscribe({
      next: (usuario) => {
        if (usuario) {
          this.cliente.nombre = usuario.nombre || '';
          this.cliente.email = usuario.email || '';
          this.cliente.telefono = usuario.telefono || '';
          this.cliente.direccion = usuario.direccion || '';
          this.cliente.ciudad = usuario.ciudad || '';
          this.cliente.codigoPostal = usuario.codigoPostal || '';
        }
        this.loading = false;
        this.cdr.detectChanges(); // Forzamos a renderizar los datos inyectados en los inputs
      },
      error: (err) => {
        console.error('No se pudieron precargar los datos del usuario:', err);
        this.loading = false;
        this.cdr.detectChanges(); // Desactivamos el spinner aunque falle la carga asíncrona
      }
    });
  }

  calcularTotal(): number {
    return this.carrito.items.reduce((acc, item) => acc + item.subtotal, 0);
  }

  calcularEnvio(): number {
    return this.calcularTotal() > 50 ? 0 : 4.99;
  }

  calcularTotalConEnvio(): number {
    return this.calcularTotal() + this.calcularEnvio();
  }

  procesarPago(): void {
    console.log('1. Click en procesarPago() detectado.');
    console.log('Datos actuales del cliente en el formulario:', this.cliente);

    if (!this.cliente.nombre || !this.cliente.email || !this.cliente.telefono || !this.cliente.ciudad) {
      console.log('❌ Detenido en validación. Faltan campos obligatorios.');
      alert('Por favor, rellena todos los campos obligatorios (*): Nombre, Email, Teléfono y Ciudad.');
      return;
    }

    this.procesando = true;
    this.cdr.detectChanges(); 
    console.log('2. Validación aprobada. Marcado como procesando = true');

    const calleEnvio = this.cliente.direccion ? this.cliente.direccion : 'Dirección no especificada';
    const cpEnvio = this.cliente.codigoPostal ? `(CP: ${this.cliente.codigoPostal})` : '';

    const pedidoDTO = {
      direccionEnvio: `${calleEnvio}, ${this.cliente.ciudad} ${cpEnvio}`,
      metodoPago: this.metodoPago.toUpperCase()
    };

    console.log('3. DTO construido listo para enviar:', pedidoDTO);

    this.pedidoService.crearPedido(pedidoDTO).subscribe({
      next: (resPedido: any) => {
        console.log('4. ¡Éxito! Pedido creado en BD. Respuesta completa del servidor:', resPedido);
        
        if (this.metodoPago === 'paypal') {
          console.log('5. El método elegido es PayPal. Iniciando pasarela para el ID:', resPedido.pedidoId);
          
          this.pedidoService.iniciarPagoPaypal(resPedido.pedidoId).subscribe({
            next: (urlRedireccion: string) => {
              console.log('6. Recibida URL de redirección desde el backend (Raw):', urlRedireccion);
              
              let urlFinal = '';

              // Si la respuesta empieza con '{', es el JSON devuelto por Spring
              if (urlRedireccion && urlRedireccion.trim().startsWith('{')) {
                try {
                  const objetoJson = JSON.parse(urlRedireccion);
                  
                  // CORRECCIÓN EXITOSA: Usamos el campo exacto de tu backend
                  urlFinal = objetoJson.redirectUrl || objetoJson.url || urlRedireccion;
                  
                  console.log('-> URL extraída con éxito del JSON:', urlFinal);
                } catch (e) {
                  console.error('Error al parsear el texto como JSON:', e);
                  urlFinal = urlRedireccion;
                }
              } else {
                urlFinal = urlRedireccion;
              }
              
              console.log('7. Intentando redirigir navegador hacia:', urlFinal);
              
              // Verificación e inicio de la pasarela
              if (urlFinal && urlFinal.trim().startsWith('http')) {
                window.location.href = urlFinal.trim();
              } else {
                console.error('❌ Error: La URL final procesada no es válida:', urlFinal);
                alert('Hubo un error con el formato del enlace de pago devuelto por el servidor.');
                this.procesando = false;
                this.cdr.detectChanges();
              }
            },
            error: (errPaypal) => {
              this.procesando = false;
              this.cdr.detectChanges();
              console.error('❌ Error en el paso 5 (iniciarPagoPaypal):', errPaypal);
              alert('Error al inicializar la pasarela de PayPal. Revisa la consola del backend.');
            }
          });
        } else if (this.metodoPago === 'mercadoPago') {
          this.procesando = false;
          this.cdr.detectChanges(); 
          alert('Módulo de Mercado Pago en desarrollo.');
        } else {
          console.log('5b. Otro método de pago. Redirigiendo a mis-pedidos...');
          this.procesando = false;
          this.cdr.detectChanges(); 
          this.router.navigate(['/mis-pedidos']);
        }
      },
      error: (errPedido) => {
        this.procesando = false;
        this.cdr.detectChanges(); 
        console.error('❌ Error en el paso 3 (crearPedido):', errPedido);
        alert('Hubo un error al registrar tu pedido en el sistema. Mira la consola de Spring Boot.');
      }
    });
  }
}