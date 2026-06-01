import { Component } from '@angular/core';
import { Venta } from '../venta/venta';

@Component({
  selector: 'app-cliente',
  imports: [],
  templateUrl: './cliente.html',
  styleUrl: './cliente.css',
})
export class Cliente {
idCliente: number;
nombre: String;
apellido: String;
telefono: number;
email: String;
ventas: Venta[];
}
