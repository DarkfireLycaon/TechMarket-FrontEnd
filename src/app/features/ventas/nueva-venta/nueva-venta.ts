import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Venta } from '../../../core/venta/venta';
import { Cliente } from '../../../core/cliente/cliente';
import { Producto } from '../../../core/producto/producto';
import { ClienteService } from '../../../core/cliente-service';
import { ProductoService } from '../../../core/producto.service';
import { VentaService } from '../../../core/venta-service';
import { DetalleVenta } from '../../../core/detalle-venta/detalle-venta';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-nueva-venta',
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './nueva-venta.html',
  styleUrl: './nueva-venta.css',
})
export class NuevaVenta {
venta: Venta = new Venta();
  clientes: Cliente[] = [];
  productos: Producto[] = [];
  // Declara una instancia limpia para el valor por defecto
productoNulo: Producto = new Producto(); 

private cdref = inject(ChangeDetectorRef);
  // Para la selección actual en el formulario
  productoSeleccionado: Producto = new Producto();
  cantidadNueva: number = 1;

  constructor(
    private clienteService: ClienteService,
    private productoService: ProductoService,
    private ventaService: VentaService
  ) {}

  ngOnInit() {
    this.cargarClientes();
    this.cargarProductos();
  }

  cargarClientes() {
    this.clienteService.obtenerClienteLista().subscribe(data => this.clientes = data);
    this.cdref.detectChanges();
  }

  cargarProductos() {
    this.productoService.obtenerProductosLista().subscribe(data => this.productos = data);
    this.cdref.detectChanges();
  }

agregarProducto() {
  if (!this.productoSeleccionado || !this.productoSeleccionado.idProducto) return;

  const detalle = new DetalleVenta();
  detalle.producto = this.productoSeleccionado;
  detalle.cantidad = this.cantidadNueva;
  
  // ASEGÚRATE DE ESTO: 
  // Si el producto no tiene precioVenta, usa el precio (o viceversa)
  detalle.precioVenta = this.productoSeleccionado.precioVenta || this.productoSeleccionado.precioVenta;

  if (!detalle.precioVenta) {
    alert("Este producto no tiene un precio de venta definido");
    return;
  }

  this.venta.detalles.push(detalle);
  this.calcularTotal();
}

  calcularTotal() {
    this.venta.total = this.venta.detalles.reduce((acc, d) => acc + (d.precioVenta * d.cantidad), 0);
  }

  guardarVenta() {
    this.ventaService.agregarVenta(this.venta).subscribe(res => {
      alert("Venta realizada con éxito");
      // Redirigir o limpiar
    });
  }
}
