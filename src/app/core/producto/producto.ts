import { Component } from '@angular/core';

@Component({
  selector: 'app-producto',
  imports: [],
  templateUrl: './producto.html',
  styleUrl: './producto.css',
})
export class Producto {
idProducto: number;
descripcion: string;
precioCompra: number;
precioVenta: number;
stock: number;

}
