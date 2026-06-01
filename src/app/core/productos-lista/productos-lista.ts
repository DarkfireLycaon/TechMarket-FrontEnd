import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../core/producto.service';
import { CarritoService } from '../../core/carrito.service';
import { CommonModule } from '@angular/common';

@Component({
   selector: 'app-productos-lista',
  templateUrl: './productos-lista.html',
  styleUrls: ['./productos-lista.css'],
  standalone: true,  // Si es standalone
  imports: [CommonModule]  // ← Agrega CommonModule aquí
})
export class ProductosListaComponent implements OnInit {
  productos: any[] = [];
  categorias = ['TELEFONIA', 'INFORMATICA', 'ELECTRONICA', 'GAMING', 'HOGAR', 'AUDIO'];
  categoriaSeleccionada: string = '';

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService
  ) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    if (this.categoriaSeleccionada) {
      this.productoService.getProductosPorCategoria(this.categoriaSeleccionada).subscribe({
        next: (data) => this.productos = data,
        error: (err) => console.error('Error:', err)
      });
    } else {
      this.productoService.getProductos().subscribe({
        next: (data) => this.productos = data,
        error: (err) => console.error('Error:', err)
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