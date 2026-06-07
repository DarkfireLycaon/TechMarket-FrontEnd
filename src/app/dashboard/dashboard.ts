import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ProductoService } from '../service/producto.service';
import { HistorialService } from '../service/historial-service';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true, // Asegúrate de tener esto
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  // Usamos Observables para que la UI se actualice sola
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
    // Asignamos directamente los observables sin suscribirnos manualmente
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
}