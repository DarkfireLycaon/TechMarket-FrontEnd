import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-carrito',
  imports: [CommonModule, RouterModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito {
 constructor() {
    console.log('CarritoComponent cargado');
  }
}
