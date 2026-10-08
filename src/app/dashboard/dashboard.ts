import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { ProductoService } from '../service/producto.service';
import { HistorialService } from '../service/historial-service';
import { Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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
  recomendacionesEstado: 'loading' | 'ok' | 'vacio' | 'error' = 'loading';
  errorRecomendaciones = '';

  private router = inject(Router);
  private productoService = inject(ProductoService);
  private historialService = inject(HistorialService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.cargarDatos();
    this.cdr.detectChanges();
  }

  cargarDatos() {
    this.ultimosVisitados$ = this.historialService.getUltimosVisitados();
    this.ofertas$ = this.productoService.getOfertas();

    this.recomendados$ = this.historialService.getRecomendaciones().pipe(
      tap((respuesta) => {
        const lista = Array.isArray(respuesta)
          ? respuesta
          : ((respuesta as any)?.content ?? []);
        this.recomendacionesEstado = lista.length ? 'ok' : 'vacio';
        this.errorRecomendaciones = '';
        this.cdr.detectChanges();
      }),
      catchError((error) => {
        console.error('Error al cargar recomendaciones:', error);
        this.recomendacionesEstado = 'error';
        this.errorRecomendaciones = 'No se pudieron cargar las recomendaciones. Reintenta más tarde.';
        this.cdr.detectChanges();
        return of([]);
      })
    );

    this.cdr.detectChanges();
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
