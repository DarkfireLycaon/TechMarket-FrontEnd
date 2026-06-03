import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CarritoService } from '../../service/carrito.service';
import { AuthService } from '../../service/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-carrito',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito {
carrito: any = { items: [], total: 0 };
  loading = false;

  constructor(
    private carritoService: CarritoService,
    private authService: AuthService,
    private router: Router,
     private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.cargarCarrito();
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

  actualizarCantidad(productoId: number, nuevaCantidad: number): void {
    if (nuevaCantidad < 1) {
      this.eliminarProducto(productoId);
      return;
    }

    this.carritoService.actualizarCantidad(productoId, nuevaCantidad).subscribe({
      next: () => this.cargarCarrito(),
      error: (error) => console.error('Error al actualizar:', error)
    });
  }

  eliminarProducto(productoId: number): void {
    this.carritoService.eliminarProducto(productoId).subscribe({
      next: () => this.cargarCarrito(),
      error: (error) => console.error('Error al eliminar:', error)
    });
  }

  vaciarCarrito(): void {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      this.carritoService.vaciarCarrito().subscribe({
        next: () => this.cargarCarrito(),
        error: (error) => console.error('Error al vaciar:', error)
      });
    }
  }

  calcularTotal(): number {
    return this.carrito.items?.reduce((sum: number, item: any) => sum + item.subtotal, 0) || 0;
  }

  calcularEnvio(): number {
    const total = this.calcularTotal();
    if (total === 0) return 0;
    return total > 100 ? 0 : 10;
  }

  calcularTotalConEnvio(): number {
    return this.calcularTotal() + this.calcularEnvio();
  }

  procederPago(): void {
    if (!this.authService.isLoggedIn()) {
      alert('Debes iniciar sesión para continuar');
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/checkout']);
  }

  getIconoCategoria(categoria: string): string {
    const iconos: { [key: string]: string } = {
      'TELEFONIA': 'fas fa-mobile-alt',
      'INFORMATICA': 'fas fa-laptop',
      'GAMING': 'fas fa-gamepad',
      'ELECTRONICA': 'fas fa-tv',
      'HOGAR': 'fas fa-micro-wave',
      'AUDIO': 'fas fa-headphones'
    };
    return iconos[categoria] || 'fas fa-box';
  }
    cambiarCantidad(productoId: number, valor: string): void {
    const cantidad = parseInt(valor, 10);
    if (isNaN(cantidad) || cantidad < 1) {
      this.eliminarProducto(productoId);
    } else {
      this.actualizarCantidad(productoId, cantidad);
    }
  }
}
