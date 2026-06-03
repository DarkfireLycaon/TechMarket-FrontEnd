import { ChangeDetectorRef, Component } from '@angular/core';
import { CarritoService } from '../../../service/carrito.service';
import { PedidoService } from '../../../service/pedido.service';
import { AuthService } from '../../../service/auth';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  carrito: any = { items: [], total: 0 };
  loading = true;
  procesando = false;
  
  // Datos del cliente
  cliente = {
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    notas: ''
  };
  
  // Solo pago contra entrega (sin Stripe)
  metodoPago: string = 'efectivo';
  metodosPago = [
    { valor: 'efectivo', nombre: 'Pago contra entrega', icono: 'fas fa-money-bill' }
  ];

  constructor(
    private carritoService: CarritoService,
    private pedidoService: PedidoService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}
 
  ngOnInit(): void {
    this.cargarCarrito();
    this.cargarDatosUsuario();
  }

  cargarCarrito(): void {
    this.loading = true;
    this.carritoService.obtenerCarrito().subscribe({
      next: (data) => {
        this.carrito = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar carrito:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarDatosUsuario(): void {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.cliente.nombre = usuario.nombre || '';
    this.cliente.email = usuario.email || '';
  }

  calcularTotal(): number {
    return this.carrito.items?.reduce((sum: number, item: any) => sum + (item.subtotal || 0), 0) || 0;
  }

  calcularEnvio(): number {
    const total = this.calcularTotal();
    if (total === 0) return 0;
    return total > 100 ? 0 : 10;
  }

  calcularTotalConEnvio(): number {
    return this.calcularTotal() + this.calcularEnvio();
  }

  validarFormulario(): boolean {
    if (!this.cliente.nombre) {
      alert('Ingresa tu nombre completo');
      return false;
    }
    if (!this.cliente.email) {
      alert('Ingresa tu email');
      return false;
    }
    if (!this.cliente.telefono) {
      alert('Ingresa tu teléfono');
      return false;
    }
    if (!this.cliente.direccion) {
      alert('Ingresa tu dirección de envío');
      return false;
    }
    if (!this.cliente.ciudad) {
      alert('Ingresa tu ciudad');
      return false;
    }
    return true;
  }

  procesarPago(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.procesando = true;

    const pedido = {
      direccionEnvio: `${this.cliente.direccion}, ${this.cliente.ciudad}, CP: ${this.cliente.codigoPostal}`,
      metodoPago: this.metodoPago,
      telefonoContacto: this.cliente.telefono,
      notas: this.cliente.notas,
      total: this.calcularTotalConEnvio()
    };

    this.pedidoService.crearPedido(pedido).subscribe({
      next: (response) => {
        console.log('Pedido creado:', response);
        this.finalizarCompra(response);
      },
      error: (error) => {
        console.error('Error al crear pedido:', error);
        alert('Error al procesar el pedido: ' + (error.error?.error || 'Intenta nuevamente'));
        this.procesando = false;
      }
    });
  }

  finalizarCompra(response: any): void {
    this.procesando = false;
    alert('¡Pedido realizado con éxito!');
    
    // Limpiar carrito local
    this.carrito = { items: [], total: 0 };
    
    // Redirigir a mis pedidos
    this.router.navigate(['/mis-pedidos']);
  }
}