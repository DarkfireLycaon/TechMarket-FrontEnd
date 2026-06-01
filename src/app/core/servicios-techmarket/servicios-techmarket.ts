import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-servicios-techmarket',
  imports: [CommonModule, RouterModule],
  templateUrl: './servicios-techmarket.html',
  styleUrl: './servicios-techmarket.css',
})
export class ServiciosTechmarket {
constructor() {
    console.log('CarritoComponent cargado');
  }
}
