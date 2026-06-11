import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../../service/producto.service';
import { HistorialService } from '../../../service/historial-service';
import { CurrencyPipe } from '@angular/common';
import Swal from 'sweetalert2';
import { CarritoService } from '../../../service/carrito.service';

@Component({
  selector: 'app-detalle-producto',
  imports: [CurrencyPipe],
  templateUrl: './detalle-producto.html',
  styleUrl: './detalle-producto.css',
})
export class DetalleProducto implements OnInit {
  producto: any;
  private route = inject(ActivatedRoute);
  private productoService = inject(ProductoService);
  private historialService = inject(HistorialService);
private carritoService = inject(CarritoService);
constructor(
  private cdr: ChangeDetectorRef,
  
   
){}
  ngOnInit() {
    const id = Number(this.route.snapshot.params['id']);
    
    // 1. Cargar datos del producto
    this.productoService.obtenerProductoPorId(id).subscribe(data => {
      this.producto = data;
      this.cdr.detectChanges();
      // 2. REGISTRAR VISITA (Aquí es donde se conecta con tu backend)
      this.historialService.registrarVisita(id).subscribe({
        next: () => console.log('Visita registrada en el historial'),
        error: (err) => console.error('Error al registrar visita', err)
       
      });
      
    });
      this.cdr.detectChanges();
  }
   private mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' | 'warning' = 'success'): void {
      // Usar SweetAlert2 si está instalado, o alert simple
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: tipo === 'success' ? '¡Éxito!' : 'Atención',
          text: mensaje,
          icon: tipo,
          timer: 2000,
          showConfirmButton: false,
          
        });
      } else {
        // Fallback con alert
        alert(mensaje);
         this.cdr.detectChanges();
      }
      
      // Opcional: también mostrar en consola
      console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
    }
agregarAlCarrito(productoId: number): void {
    console.log('Intentando agregar producto ID:', productoId);
    
    // Verificar si hay token
    const token = localStorage.getItem('token');
    if (!token) {
      this.mostrarNotificacion('Debes iniciar sesión primero', 'warning');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }

    // 3. LLAMADA REAL AL SERVICIO
    this.carritoService.agregarProducto(productoId, 1).subscribe({
      next: (response) => {
        console.log('Producto agregado:', response);
        this.mostrarNotificacion('Producto añadido al carrito', 'success');
      },
      error: (error) => {
        console.error('Error al agregar:', error);
        this.mostrarNotificacion('No se pudo agregar el producto', 'error');
      }
    });
  }
}