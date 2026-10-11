import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { ProductoService } from '../service/producto.service';
import { HistorialService } from '../service/historial-service';
import { Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap, timeout } from 'rxjs/operators';
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
      timeout({ first: 8000 }),
      map((respuesta) => Array.isArray(respuesta) ? respuesta : ((respuesta as any)?.content ?? [])),
      catchError((error) => {
        console.warn('No se pudieron cargar las recomendaciones personalizadas:', error);
        return of([]);
      }),
      switchMap((lista) => lista.length ? of(lista) : this.cargarRecomendacionesGenericas()),
      tap((lista) => {
        this.recomendacionesEstado = lista.length ? 'ok' : 'vacio';
        this.errorRecomendaciones = '';
        this.cdr.detectChanges();
      }),
      catchError((error) => {
        console.error('No se pudieron cargar productos recomendados:', error);
        this.recomendacionesEstado = 'error';
        this.errorRecomendaciones = 'No se pudieron cargar productos recomendados.';
        this.cdr.detectChanges();
        return of([]);
      })
    );

    this.cdr.detectChanges();
  }

  verDetalle(prod: any) {
    const id = prod?.idProducto ?? prod?.id ?? prod?.id_producto;
    if (id !== undefined && id !== null && id !== '') {
      this.router.navigate(['/detalle', id]);
    } else {
      console.error("No se pudo obtener el idProducto", prod);
    }
  }

  abrirDetalle(event: MouseEvent, prod: any): void {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    this.verDetalle(prod);
  }

  irAOfertas() {
  this.router.navigate(['/ofertas']);
  }

  private cargarRecomendacionesGenericas(): Observable<any[]> {
    return this.productoService.getProductos().pipe(
      timeout({ first: 8000 }),
      map((respuesta: any) => {
        const productos = Array.isArray(respuesta) ? respuesta : (respuesta?.content ?? []);
        return [...productos]
          .filter((producto) => Number(producto.stock) > 0)
          .sort((a, b) => Number(b.destacado) - Number(a.destacado) || Number(b.totalVendidos) - Number(a.totalVendidos))
          .slice(0, 2);
      })
    );
  }
}
