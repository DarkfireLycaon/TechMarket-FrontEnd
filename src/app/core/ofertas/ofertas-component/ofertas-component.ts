import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Producto } from '../../producto/producto';
import { ProductoService } from '../../../service/producto.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SafeImageDirective } from '../../../directives/safe-image.directive';
import { CarritoService } from '../../../service/carrito.service';
import { wishlistService } from '../../../service/wishlist-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ofertas-component',
  imports: [CommonModule, CurrencyPipe, SafeImageDirective, RouterLink],
  templateUrl: './ofertas-component.html',
  styleUrl: './ofertas-component.css',
})
export class OfertasComponent implements OnInit {
  productosOferta: Producto[] = [];
  productosFiltrados: Producto[] = [];
  wishlistIds: number[] = [];
  filtroActual = 'Todos';
  tieneSesion = false;

  filtros = [
    'Todos',
    'Gaming',
    'Laptop',
    'Audio',
    'TV',
    'Celular',
    'Accesorio',
    'Ofertas'
  ];

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private wishlistService: wishlistService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.tieneSesion = Boolean(localStorage.getItem('token'));
    this.cargarOfertas();
    if (this.tieneSesion) this.cargarWishlist();
  }

  private cargarOfertas(): void {
    this.productoService.getOfertas().subscribe({
      next: (data) => {
        this.productosOferta = data;
        this.aplicarFiltro(this.filtroActual);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar ofertas', err)
    });
  }

  aplicarFiltro(filtro: string): void {
    this.filtroActual = filtro;

    if (filtro === 'Todos') {
      this.productosFiltrados = [...this.productosOferta];
      return;
    }

    const termino = filtro.toLowerCase();
    this.productosFiltrados = this.productosOferta.filter((producto: any) => {
      const nombre = (producto?.nombre || '').toLowerCase();
      const categoria = (producto?.categoria || '').toLowerCase();
      return nombre.includes(termino) || categoria.includes(termino);
    });
  }

  private cargarWishlist(): void {
    this.wishlistService.getWishlist().subscribe({
      next: (wishlist) => {
        this.wishlistIds = (wishlist ?? [])
          .map((item: any) => Number(item?.idProducto ?? item?.productId ?? item?.id ?? item?.producto?.idProducto ?? item?.producto?.id ?? 0))
          .filter((id) => !Number.isNaN(id) && id > 0);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar wishlist', err)
    });
  }

  private obtenerIdProducto(producto: any): number | null {
    const id = Number(producto?.idProducto ?? producto?.id ?? producto?.id_producto ?? 0);
    return Number.isNaN(id) || id <= 0 ? null : id;
  }

  private mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' | 'warning' = 'success'): void {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: tipo === 'success' ? '¡Éxito!' : 'Atención',
        text: mensaje,
        icon: tipo,
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      alert(mensaje);
    }
  }

  isInWishlist(producto: any): boolean {
    const id = this.obtenerIdProducto(producto);
    return id !== null && this.wishlistIds.includes(id);
  }

  agregarAlCarrito(producto: Producto): void {
    const productoId = this.obtenerIdProducto(producto);

    if (!productoId) {
      this.mostrarNotificacion('No se pudo identificar el producto', 'error');
      return;
    }

    this.carritoService.agregarProducto(productoId, 1).subscribe({
      next: () => this.mostrarNotificacion('Producto añadido al carrito', 'success'),
      error: () => this.mostrarNotificacion('No se pudo agregar el producto', 'error')
    });
  }

  toggleWishlist(producto: any): void {
    const productoId = this.obtenerIdProducto(producto);
    if (!productoId) {
      this.mostrarNotificacion('No se pudo identificar el producto', 'error');
      return;
    }

    const yaEsta = this.wishlistIds.includes(productoId);

    if (yaEsta) {
      this.wishlistService.removeFromWishlist(productoId).subscribe({
        next: () => {
          this.wishlistIds = this.wishlistIds.filter((id) => id !== productoId);
          this.mostrarNotificacion('Eliminado de la wishlist', 'success');
          this.cdr.detectChanges();
        },
        error: () => this.mostrarNotificacion('No se pudo quitar de la wishlist', 'error')
      });
      return;
    }

    this.wishlistService.addToWishlist(productoId).subscribe({
      next: () => {
        this.wishlistIds = [...this.wishlistIds, productoId];
        this.mostrarNotificacion('Añadido a la wishlist', 'success');
        this.cdr.detectChanges();
      },
      error: () => this.mostrarNotificacion('No se pudo añadir a la wishlist', 'error')
    });
  }
}