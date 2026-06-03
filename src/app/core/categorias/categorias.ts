import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductoService } from '../../service/producto.service';
import { CarritoService } from '../../service/carrito.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.html',
  styleUrls: ['./categorias.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class Categorias implements OnInit {
 productos: any[] = [];
  categoriaActual: string = '';
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categoriaActual = params['categoria'];
      this.cargarProductosPorCategoria();

    });
  }

  cargarProductosPorCategoria(): void {
    this.loading = true;
    
    const categoriaMap: { [key: string]: string } = {
      televisiones: 'TELEFONIA',
      informatica: 'INFORMATICA',
      videojuegos: 'GAMING',
      telefonia: 'TELEFONIA',
      electrodomesticos: 'HOGAR',
      audio: 'AUDIO',
      fotografia: 'ELECTRONICA',
      'smart-home': 'HOGAR',
      accesorios: 'ELECTRONICA',
      impresion: 'INFORMATICA'
    };

    const categoriaBD = categoriaMap[this.categoriaActual] || this.categoriaActual.toUpperCase();
    
    this.productoService.getProductosPorCategoria(categoriaBD).subscribe({
      next: (data) => {
        this.productos = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.loading = false;
        this.mostrarNotificacion('Error al cargar productos', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  // Método para agregar al carrito mejorado
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
    
    this.carritoService.agregarProducto(productoId, 1).subscribe({
      next: (response) => {
        console.log('Producto agregado correctamente:', response);
        this.mostrarNotificacion('Producto agregado al carrito', 'success');
      },
      error: (error) => {
        console.error('Error al agregar:', error);
        
        // Mostrar mensaje de error específico
        let mensaje = 'Error al agregar el producto';
        if (error.message && error.message.includes('stock')) {
          mensaje = 'No hay suficiente stock';
        } else if (error.message && error.message.includes('token')) {
          mensaje = 'Tu sesión expiró, inicia sesión nuevamente';
          setTimeout(() => window.location.href = '/login', 1500);
        }
        
        this.mostrarNotificacion(mensaje, 'error');
      }
    });
  }

  private mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' | 'warning' = 'success'): void {
    // Usar SweetAlert2 si está instalado, o alert simple
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: tipo === 'success' ? '¡Éxito!' : 'Atención',
        text: mensaje,
        icon: tipo,
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      // Fallback con alert
      alert(mensaje);
    }
    
    // Opcional: también mostrar en consola
    console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
  }

  getCategoriaInfo(): { nombre: string, icono: string } {
    const categoriasInfo: { [key: string]: { nombre: string, icono: string } } = {
      televisiones: { nombre: 'Televisiones', icono: 'fas fa-tv' },
      informatica: { nombre: 'Informática', icono: 'fas fa-laptop' },
      videojuegos: { nombre: 'Videojuegos', icono: 'fas fa-gamepad' },
      telefonia: { nombre: 'Telefonía', icono: 'fas fa-mobile-alt' },
      electrodomesticos: { nombre: 'Electrodomésticos', icono: 'fas fa-blender' },
      audio: { nombre: 'Audio', icono: 'fas fa-headphones' },
      fotografia: { nombre: 'Fotografía', icono: 'fas fa-camera' },
      'smart-home': { nombre: 'Smart Home', icono: 'fas fa-home' },
      accesorios: { nombre: 'Accesorios', icono: 'fas fa-plug' },
      impresion: { nombre: 'Impresión', icono: 'fas fa-print' }
    };
    return categoriasInfo[this.categoriaActual] || { 
      nombre: this.categoriaActual, 
      icono: 'fas fa-tag' 
    };
  }
}