import { Component } from '@angular/core';
import { Producto } from '../producto/producto';

@Component({
  selector: 'app-detalle-venta',
  imports: [],
  templateUrl: './detalle-venta.html',
  styleUrl: './detalle-venta.css',
})
export class DetalleVenta {
idDetalle?: number;
    producto: Producto = new Producto();
    cantidad: number = 0;
    precioVenta: number = 0; // El precio histórico al momento de la venta
}
