import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PedidoService } from '../../../service/pedido.service'; 
import { AuthService } from '../../../service/auth'; // <--- Inyectamos tu AuthService
import { CarritoService } from '../../../service/carrito.service';
import { Carrito } from '../../carrito/carrito';

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
  esInvitado = false;
  mostrarOpcionesAcceso = false;
  carrito: any = { items: [] };
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

  metodoPago = 'stripe';
 


  constructor(
    private pedidoService: PedidoService,
    private authService: AuthService, 
    private carritoService: CarritoService,
    private router: Router,
    private cdr: ChangeDetectorRef // <-- Inyectado correctamente
  ) { }

// En tu clase Checkout, agrega una variable para el total
totalCarrito: number = 0;

// Y ajusta la carga:
ngOnInit(): void {
  this.esInvitado = !this.authService.getToken();
  this.mostrarOpcionesAcceso = this.esInvitado;
  if (!this.esInvitado) this.cargarDatosUsuario();
  
  // 1. Cargamos el carrito de forma asíncrona
  this.carritoService.obtenerCarrito().subscribe({
    next: (data: any) => {
      this.carrito = data;
      this.totalCarrito = data.total || 0; // Guardamos el total que viene del backend
      console.log("🛒 Carrito cargado correctamente:", this.carrito);
      this.cdr.detectChanges(); // IMPORTANTE: Avisar a Angular que ya tenemos los datos
    },
    error: (err) => {
      console.error("Error al cargar el carrito en el checkout:", err);
    }
  });
}

// Ahora, simplifica tus funciones de cálculo:
calcularTotal(): number {
  // Retornamos el total capturado o el cálculo del reduce si el total viene 0
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
    console.log('1. Click en procesarPago() detectado.');
    console.log('Datos actuales del cliente en el formulario:', this.cliente);

    if (!this.cliente.nombre || !this.cliente.email || !this.cliente.telefono || !this.cliente.ciudad) {
      console.log('❌ Detenido en validación. Faltan campos obligatorios.');
      alert('Por favor, rellena todos los campos obligatorios (*): Nombre, Email, Teléfono y Ciudad.');
      return;
    }

    if (!this.carrito.items?.length) {
      alert('Tu carrito está vacío. Añade productos antes de continuar.');
      this.router.navigate(['/carrito']);
      return;
    }

    this.procesando = true;
    this.cdr.detectChanges(); 
    console.log('2. Validación aprobada. Marcado como procesando = true');

    if (this.esInvitado) {
      this.procesarPagoInvitado();
      return;
    }

    const calleEnvio = this.cliente.direccion ? this.cliente.direccion : 'Dirección no especificada';
    const cpEnvio = this.cliente.codigoPostal ? `(CP: ${this.cliente.codigoPostal})` : '';

    const pedidoDTO = {
      direccionEnvio: `${calleEnvio}, ${this.cliente.ciudad} ${cpEnvio}`,
      metodoPago: 'STRIPE',
      items: this.carrito.items
    };

    console.log('3. DTO construido listo para enviar:', pedidoDTO);

    this.pedidoService.crearPedido(pedidoDTO).subscribe({
      next: (resPedido: any) => {
        console.log('4. ¡Éxito! Pedido creado en BD. Respuesta completa del servidor:', resPedido);
        
        const pedidoId = Number(resPedido.pedidoId ?? resPedido.idPedido ?? resPedido.id);
        if (!pedidoId) {
          this.finalizarConError('El pedido se creó, pero no recibimos un identificador válido.');
          return;
        }

        this.pedidoService.iniciarPagoStripe(pedidoId).subscribe({
          next: (respuesta) => this.redirigirAStripe(respuesta),
          error: (error) => {
            console.error('Error al crear la sesión Stripe:', error);
            this.finalizarConError(error.error?.mensaje || 'No se pudo iniciar el pago con Stripe.');
          }
        });
      },
      error: (errPedido) => {
        this.procesando = false;
        this.cdr.detectChanges(); 
        console.error('❌ Error en el paso 3 (crearPedido):', errPedido);
        alert('Hubo un error al registrar tu pedido en el sistema. Mira la consola de Spring Boot.');
      }
    });
  }

  private procesarPagoInvitado(): void {
    const direccion = [this.cliente.direccion, this.cliente.ciudad, this.cliente.codigoPostal]
      .filter(Boolean)
      .join(', ');
    const items = this.carrito.items.map((item: any) => ({
      productoId: Number(item.producto?.idProducto ?? item.productoId ?? item.producto?.id),
      cantidad: Number(item.cantidad)
    })).filter((item: any) => item.productoId > 0 && item.cantidad > 0);

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
        this.finalizarConError(error.error?.mensaje || 'No se pudo iniciar el pago con Stripe.');
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
}