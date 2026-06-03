import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProductoService } from '../../service/producto.service';
import { CarritoService } from '../../service/carrito.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-productos-lista',
  templateUrl: './productos-lista.html',
  styleUrls: ['./productos-lista.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ProductosListaComponent implements OnInit {
  productos: any[] = [];
  categorias = ['TELEFONIA', 'INFORMATICA', 'ELECTRONICA', 'GAMING', 'HOGAR', 'AUDIO'];
  categoriaSeleccionada: string = '';

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private cdr: ChangeDetectorRef 
  ) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    if (this.categoriaSeleccionada) {
      this.productoService.getProductosPorCategoria(this.categoriaSeleccionada).subscribe({
        next: (data) => {
          this.productos = data;
          this.cdr.detectChanges();  // ← Correcto: dentro de next, antes de cerrar
        },
        error: (err) => {
          console.error('Error:', err);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.productoService.getProductos().subscribe({
        next: (data) => {
          this.productos = data;
          this.cdr.detectChanges();  // ← Correcto: dentro de next, antes de cerrar
        },
        error: (err) => {
          console.error('Error:', err);
          this.cdr.detectChanges();
        }
      });
    }
  }

  filtrarPorCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
    this.cargarProductos();
  }

  agregarAlCarrito(producto: any): void {
    this.carritoService.agregarProducto(producto.idProducto, 1).subscribe({
      next: () => alert(`${producto.nombre} agregado al carrito`),
      error: (err) => alert('Error al agregar: ' + err.error?.error)
    });
  }
}