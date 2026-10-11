import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PedidoService } from '../../../service/pedido.service';
import { AuthService } from '../../../service/auth';
import { CarritoService } from '../../../service/carrito.service';

@Component({
  selector: 'app-checkout',
  standalone: true, 
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class Checkout implements OnInit {
  
  loading = false;
  procesando = false;
  carritoCargando = true;
  errorCarrito = '';
  esInvitado = false;
  mostrarOpcionesAcceso = false;
  carrito: any = { items: [] };
  cliente = {
    nombre: '',
    email: '',
    telefono: '',
    codigoPostal: '',
    direccion: '',
    ciudad: '',
    notas: ''
  };

  metodoPago = 'stripe';

  constructor(
    private pedidoService: PedidoService,
    private authService: AuthService,
    private carritoService: CarritoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  totalCarrito = 0;

  ngOnInit(): void {
    this.esInvitado = !this.authService.getToken();
    this.mostrarOpcionesAcceso = this.esInvitado;
    if (!this.esInvitado) this.cargarDatosUsuario();
    this.cargarCarrito();
  }

  private cargarCarrito(): void {
    this.carritoCargando = true;
    this.errorCarrito = '';
    this.carritoService.obtenerCarrito().subscribe({
      next: (carrito: any) => {
        this.actualizarCarrito(carrito);
        this.carritoCargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar el carrito en el checkout:', error);
        this.errorCarrito = this.obtenerMensajeError(error, 'No se pudo cargar el carrito.');
        this.carritoCargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private actualizarCarrito(carrito: any): void {
    this.carrito = carrito;
    this.totalCarrito = Number(carrito?.total) || 0;
  }

  calcularTotal(): number {
    return this.totalCarrito > 0
      ? this.totalCarrito
      : (this.carrito.items?.reduce((acc: number, item: any) => acc + item.subtotal, 0) || 0);
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



  calcularEnvio(): number {
    return this.calcularTotal() > 50 ? 0 : 4.99;
  }

  calcularTotalConEnvio(): number {
    return this.calcularTotal() + this.calcularEnvio();
  }

  continuarComoInvitado(): void {
    this.esInvitado = true;
    this.metodoPago = 'stripe';
    this.mostrarOpcionesAcceso = false;
  }

  irARegistro(): void {
    this.router.navigate(['/registrar'], { queryParams: { returnUrl: '/checkout' } });
  }

  irALogin(): void {
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
  }

  procesarPago(): void {
    if (!this.cliente.nombre || !this.cliente.email || !this.cliente.telefono || !this.cliente.ciudad) {
      alert('Por favor, rellena todos los campos obligatorios (*): Nombre, Email, Teléfono y Ciudad.');
      return;
    }

    if (this.carritoCargando || this.errorCarrito) {
      alert(this.errorCarrito || 'Espera a que termine de cargarse el carrito.');
      return;
    }

    this.procesando = true;
    this.cdr.detectChanges();

    // Refresh at submission time so payment always uses the latest cart for this session/account.
    this.carritoService.obtenerCarrito().subscribe({
      next: (carrito: any) => {
        this.actualizarCarrito(carrito);
        if (!carrito.items?.length) {
          this.finalizarConError(this.esInvitado
            ? 'Tu carrito está vacío. Añade productos antes de continuar.'
            : 'El carrito de tu cuenta está vacío. Añade productos con esta cuenta y vuelve a intentarlo.');
          return;
        }

        if (this.esInvitado) {
          this.procesarPagoInvitado(carrito);
        } else {
          this.procesarPagoCuenta();
        }
      },
      error: (error) => {
        console.error('No se pudo verificar el carrito antes del pago:', error);
        this.finalizarConError(this.obtenerMensajeError(error, 'No se pudo verificar el carrito antes del pago.'));
      }
    });
  }

  private procesarPagoCuenta(): void {
    const calleEnvio = this.cliente.direccion ? this.cliente.direccion : 'Dirección no especificada';
    const cpEnvio = this.cliente.codigoPostal ? `(CP: ${this.cliente.codigoPostal})` : '';

    const pedidoDTO = {
      direccionEnvio: `${calleEnvio}, ${this.cliente.ciudad} ${cpEnvio}`,
      metodoPago: 'STRIPE'
    };

    this.pedidoService.crearPedido(pedidoDTO).subscribe({
      next: (resPedido: any) => {
        const pedidoId = Number(resPedido.pedidoId ?? resPedido.idPedido ?? resPedido.id);
        if (!pedidoId) {
          this.finalizarConError('El pedido se creó, pero no recibimos un identificador válido.');
          return;
        }

        this.pedidoService.iniciarPagoStripe(pedidoId).subscribe({
          next: (respuesta) => this.redirigirAStripe(respuesta),
          error: (error) => {
            console.error('Error al crear la sesión Stripe:', error);
            this.finalizarConError(this.obtenerMensajeError(error, 'No se pudo iniciar el pago con Stripe.'));
          }
        });
      },
      error: (error) => {
        console.error('Error al crear el pedido de la cuenta:', error);
        this.finalizarConError(this.obtenerMensajeError(error, 'No se pudo registrar el pedido de tu cuenta.'));
      }
    });
  }

  private procesarPagoInvitado(carrito: any): void {
    const direccion = [this.cliente.direccion, this.cliente.ciudad, this.cliente.codigoPostal]
      .filter(Boolean)
      .join(', ');
    const items = carrito.items.map((item: any) => ({
      productoId: Number(item.producto?.idProducto ?? item.productoId ?? item.producto?.id),
      cantidad: Number(item.cantidad)
    })).filter((item: any) => item.productoId > 0 && item.cantidad > 0);

    if (!items.length) {
      this.finalizarConError('No se encontraron productos válidos en el carrito para crear el pedido.');
      return;
    }

    this.pedidoService.crearPedidoInvitado({
      nombre: this.cliente.nombre.trim(),
      email: this.cliente.email.trim(),
      telefono: this.cliente.telefono.trim(),
      direccionEnvio: direccion,
      ciudad: this.cliente.ciudad.trim(),
      codigoPostal: this.cliente.codigoPostal.trim(),
      notas: this.cliente.notas.trim(),
      metodoPago: 'STRIPE',
      items
    }).subscribe({
      next: (respuesta: any) => {
        this.redirigirAStripe(respuesta);
      },
      error: (error) => {
        console.error('Error al crear el pedido invitado:', error);
        this.finalizarConError(this.obtenerMensajeError(error, 'No se pudo iniciar el pago con Stripe.'));
      }
    });
  }

  private redirigirAStripe(respuesta: any): void {
    let resultado = respuesta;
    if (typeof resultado === 'string' && resultado.trim().startsWith('{')) {
      try {
        resultado = JSON.parse(resultado);
      } catch {
        resultado = respuesta;
      }
    }

    const redirectUrl = typeof resultado === 'string'
      ? resultado.trim()
      : (resultado?.redirectUrl ?? resultado?.url ?? '').toString().trim();

    if (/^https?:\/\//.test(redirectUrl)) {
      window.location.assign(redirectUrl);
      return;
    }

    this.finalizarConError('El servidor no devolvió un enlace de pago Stripe válido.');
  }

  private finalizarConError(mensaje: string): void {
    this.procesando = false;
    this.cdr.detectChanges();
    alert(mensaje);
  }

  private obtenerMensajeError(error: any, mensajePredeterminado: string): string {
    return error?.error?.mensaje || error?.error?.error || error?.message || mensajePredeterminado;
  }
}