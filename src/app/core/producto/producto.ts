import { Component } from '@angular/core';

@Component({
  selector: 'app-producto',
  imports: [],
  templateUrl: './producto.html',
  styleUrl: './producto.css',
})
export class Producto {
idProducto: number;
  nombre: string;
  descripcion: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  imagenUrl: string;
  categoria: string;
  marca: string;
  disponible: boolean;
  esOferta: boolean;
  precioOferta: number;
  calificacion: number;
  totalVendidos: number;
  destacado: boolean;

}
