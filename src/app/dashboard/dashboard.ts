import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { ProductoService } from '../service/producto.service';
import { HistorialService } from '../service/historial-service';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { register } from 'swiper/element/bundle';
import { SafeImageDirective } from '../directives/safe-image.directive';

register();

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeImageDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  

  ultimosVisitados$!: Observable<any[]>;
  ofertas$!: Observable<any[]>;
  recomendados$!: Observable<any[]>;

  private router = inject(Router);
  private productoService = inject(ProductoService);
  private historialService = inject(HistorialService);

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    // Al asignar los observables, no necesitas hacer nada más.
    // El HTML se encargará de suscribirse con el pipe | async.
    this.ultimosVisitados$ = this.historialService.getUltimosVisitados();
    this.ofertas$ = this.productoService.getOfertas();
    this.recomendados$ = this.historialService.getRecomendaciones();
  }

  verDetalle(prod: any) {
    const id = prod?.idProducto; 
    if (id) {
      this.router.navigate(['/detalle', id]);
    } else {
      console.error("No se pudo obtener el idProducto", prod);
    }
  }
  irAOfertas() {
  this.router.navigate(['/ofertas']);
  }
}
