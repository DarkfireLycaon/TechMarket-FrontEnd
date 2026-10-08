import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HistorialService } from '../../service/historial-service';
import { SafeImageDirective } from '../../directives/safe-image.directive';

@Component({
  selector: 'app-historial-visitas',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, SafeImageDirective],
  templateUrl: './historial-visitas.html',
  styleUrl: './historial-visitas.css'
})
export class HistorialVisitas implements OnInit {
  visitas: any[] = [];
  cargando = false;
  private ultimaRutaHistorial = '';

  constructor(
    private historialService: HistorialService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const url = event.urlAfterRedirects || this.router.url;
      if (url.includes('/historial-visitas') && url !== this.ultimaRutaHistorial) {
        this.ultimaRutaHistorial = url;
        this.cargarHistorial();
      }
    });
  }

  ngOnInit(): void {
    this.ultimaRutaHistorial = this.router.url;
    this.cargarHistorial();
  }

  private normalizarHistorial(data: any[]): any[] {
    const mapa = new Map<number, any>();

    for (const item of Array.isArray(data) ? data : []) {
      const idProducto = Number(item?.idProducto ?? item?.producto?.idProducto ?? item?.id ?? 0);
      if (!idProducto) continue;

      const fecha = item?.fechaVisita ?? item?.fecha ?? item?.updatedAt ?? '';
      const actual = mapa.get(idProducto);

      if (!actual || new Date(fecha).getTime() > new Date(actual.fechaVisita ?? actual.fecha ?? actual.updatedAt ?? 0).getTime()) {
        mapa.set(idProducto, {
          ...item,
          idProducto,
          nombre: item?.nombre ?? item?.producto?.nombre ?? 'Producto',
          precioVenta: item?.precioVenta ?? item?.producto?.precioVenta ?? item?.precio ?? 0,
          imagenUrl: item?.imagenUrl ?? item?.producto?.imagenUrl ?? item?.imagen ?? '',
          fechaVisita: fecha
        });
      }
    }

    return Array.from(mapa.values()).sort((a, b) => {
      const fechaA = new Date(a.fechaVisita ?? a.fecha ?? a.updatedAt ?? 0).getTime();
      const fechaB = new Date(b.fechaVisita ?? b.fecha ?? b.updatedAt ?? 0).getTime();
      return fechaB - fechaA;
    });
  }

  cargarHistorial(): void {
    this.cargando = true;
    this.cdr.detectChanges();

    this.historialService.getHistorialCompleto().subscribe({
      next: (data) => {
        this.visitas = this.normalizarHistorial(data);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar historial de visitas', err);
        this.visitas = [];
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  verDetalle(producto: any): void {
    const id = producto?.idProducto ?? producto?.producto?.idProducto ?? producto?.id;
    if (id) {
      this.router.navigate(['/detalle', id]);
    }
  }

  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) return 'Hace un momento';
    const fechaDate = new Date(fecha);
    if (Number.isNaN(fechaDate.getTime())) return 'Hace un momento';
    return fechaDate.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
