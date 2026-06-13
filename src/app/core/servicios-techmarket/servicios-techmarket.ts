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
  servicios = [
    { title: 'Gestión de Inventario', description: 'Control total de tus existencias en tiempo real.', icon: 'fa-box' },
    { title: 'Reportes Inteligentes', description: 'Análisis detallado de tus ventas y movimientos.', icon: 'fa-chart-line' },
    { title: 'Soporte 24/7', description: 'Asistencia técnica personalizada cuando la necesites.', icon: 'fa-headset' }
  ];
}
