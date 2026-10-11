import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../../service/producto.service';
import { HistorialService } from '../../../service/historial-service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import Swal from 'sweetalert2';
import { CarritoService } from '../../../service/carrito.service';
import { wishlistService } from '../../../service/wishlist-service';



@Component({
  selector: 'app-detalle-producto',
  imports: [CurrencyPipe, CommonModule],
  templateUrl: './detalle-producto.html',
  styleUrl: './detalle-producto.css',
})
export class DetalleProducto implements OnInit {
  producto: any; 
  esDeseado: boolean = false;
  tieneSesion = false;

  private deseadoService = inject(wishlistService);
  private route = inject(ActivatedRoute);
  private productoService = inject(ProductoService);
  private historialService = inject(HistorialService);
  private carritoService = inject(CarritoService);

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.tieneSesion = Boolean(localStorage.getItem('token'));
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.cargarProducto(id);
      }
    });
  }

  private cargarProducto(id: number) {
    this.productoService.obtenerProductoPorId(id).subscribe(data => {
      this.producto = data;
      this.cdr.detectChanges();

      // Verificar si el producto está en la lista de deseos del usuario actual
      if (this.tieneSesion) this.verificarSiEsDeseado(id);

      // Registrar visita
      this.historialService.registrarVisita(id).subscribe({
        next: () => console.log('Visita registrada'),
        error: (err) => console.error('Error al registrar', err)
      });
    });
  }

private verificarSiEsDeseado(productId: number) {
    this.deseadoService.getWishlist().subscribe({
      next: (wishlist) => {
        this.esDeseado = (wishlist ?? []).some((item: any) => {
          const itemId = item?.idProducto ?? item?.productId ?? item?.id ?? item?.producto?.idProducto ?? item?.producto?.id;
          return Number(itemId) === Number(productId);
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar wishlist', err)
    });
  }

toggleDeseado() {
  const idReal = this.producto?.idProducto ?? this.producto?.id ?? this.producto?.id_producto;

  if (!idReal) {
    console.error('¡El ID es nulo o undefined!');
    return;
  }
  
  this.deseadoService.addToWishlist(Number(idReal)).subscribe({
    next: (res) => console.log('Añadido con éxito a la wishlist', res),
    error: (err) => console.error('Error devuelto por el backend:', err)
  });
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
      this.cdr.detectChanges();
    }
  }

  agregarAlCarrito(productoId: number): void {
    this.carritoService.agregarProducto(productoId, 1).subscribe({
      next: () => this.mostrarNotificacion('Producto añadido al carrito', 'success'),
      error: () => this.mostrarNotificacion('No se pudo agregar el producto', 'error')
    });
  }
}