import { Component } from '@angular/core';
import { Cliente } from '../cliente/cliente';
import { DetalleVenta } from '../detalle-venta/detalle-venta';

@Component({
  selector: 'app-venta',
  imports: [],
  templateUrl: './venta.html',
  styleUrl: './venta.css',
})
export class Venta {
    idVenta?: number;
    fecha: string; // Lo recibimos como string ISO de Java
    total: number = 0;
    cliente: Cliente = new Cliente();
    detalles: DetalleVenta[] = [];
}
