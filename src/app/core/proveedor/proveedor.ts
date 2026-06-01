import { Component } from '@angular/core';

@Component({
  selector: 'app-proveedor',
  imports: [],
  templateUrl: './proveedor.html',
  styleUrl: './proveedor.css',
})
export class Proveedor {
 id: number;
 nombre: String;
 apellido: String;
 direccion: String;
 telefono: number;
 email: String;
}
