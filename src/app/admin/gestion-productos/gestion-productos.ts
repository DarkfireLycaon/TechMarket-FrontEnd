import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../service/producto.service';
import { Producto } from '../../core/producto/producto';


@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './gestion-productos.html',
  styleUrl: './gestion-productos.css'
})
export class GestionProductosComponent implements OnInit {
  private productoService = inject(ProductoService);

  // Signal reactivo para el listado del inventario
  productos = signal<Producto[]>([]);

  // Objeto temporal para enlazar con los inputs del Modal
  productoActual: Producto = this.inicializarProducto();
  editando: boolean = false;

  ngOnInit(): void {
    this.cargarProductos();
  }

 cargarProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (data) => {
        // 1. Esto nos dirá en la consola EXACTAMENTE qué está respondiendo Spring Boot
        console.log('--- ¡DATOS RECIBIDOS DEL BACKEND! ---', data);
        
        // 2. Comprobamos si Spring Boot devolvió un objeto paginado (Pageable)
        if (data && data.content) {
          console.log('Se detectó paginación. Extrayendo "data.content"...');
          this.productos.set(data.content);
        } 
        // 3. Comprobamos si es un Array limpio tradicional
        else if (Array.isArray(data)) {
          console.log('Se detectó un Array limpio de productos.');
          this.productos.set(data);
        } 
        // 4. Caso inesperado
        else {
          console.warn('El backend devolvió algo que no es ni Array ni página:', data);
        }
      },
      error: (err) => {
        // Esto saltará si el servidor devuelve un error de red o de seguridad (401, 403, 404)
        console.error('--- ERROR CRÍTICO AL TRAER LOS PRODUCTOS ---');
        console.error('Código de estado HTTP:', err.status);
        console.error('Detalle del error:', err);
      }
    });
  }

  abrirModalNuevo(): void {
    this.editando = false;
    this.productoActual = this.inicializarProducto();
  }

  abrirModalEditar(producto: Producto): void {
    this.editando = true;
    // Usamos el operador spread {...} para no modificar la tabla en vivo mientras escribes
    this.productoActual = { ...producto }; 
  }

  guardarProducto(): void {
    if (this.editando) {
      // Ajusta 'actualizarProducto' según el nombre exacto en tu ProductoService
      this.productoService.actualizarProducto(this.productoActual.idProducto, this.productoActual).subscribe({
        next: (prodActualizado) => {
          this.productos.update(lista => 
            lista.map(p => p.idProducto === prodActualizado.idProducto ? prodActualizado : p)
          );
        },
        error: (err) => console.error('Error al actualizar el producto:', err)
      });
    } else {
      // Ajusta 'crearProducto' según el nombre exacto en tu ProductoService
      this.productoService.agregarProducto(this.productoActual).subscribe({
        next: (prodCreado) => {
          this.productos.update(lista => [...lista, prodCreado]);
        },
        error: (err) => console.error('Error al crear el producto:', err)
      });
    }
  }

  eliminarProducto(id?: number): void {
    if (!id) return;
    
    if (confirm('¿Seguro que deseas eliminar este producto permanentemente?')) {
      this.productoService.eliminarProducto(id).subscribe({
        next: () => {
          this.productos.update(listaActual => listaActual.filter(p => p.idProducto !== id));
        },
        error: (err) => alert('Error al eliminar. Verifica los permisos del servidor.')
      });
    }
  }

  private inicializarProducto(): Producto {
    return {
      idProducto: 0,
      nombre: '',
      descripcion: '',
      precioCompra: 0,
      precioVenta: 0,
      stock: 0,
      imagenUrl: '',
      categoria: '',
      marca: '',
      disponible: true,
      esOferta: false,
      precioOferta: 0,
      calificacion: 0,
      totalVendidos: 0,
      destacado: false
    };
  }
}