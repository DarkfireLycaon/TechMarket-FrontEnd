import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Venta } from '../core/venta/venta';
import { VentaService } from '../core/venta-service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  // Variables dinámicas
  ingresosTotales: number = 0;
  gananciaTotal: number = 0;
  costoVentas: number = 0;
  margenPorcentaje: number = 0;
  private cdref = inject(ChangeDetectorRef);
  constructor(private ventaService: VentaService){}
  // Tu array de stats ahora se actualizará con los métodos
  stats: any[] = [];

  ngOnInit() {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard() {
    this.ventaService.listarVentas().subscribe(ventas => {
      this.procesarEstadisticas(ventas);
       this.cdref.detectChanges();
    });
  }

  procesarEstadisticas(ventas: any[]) {
    this.ingresosTotales = ventas.reduce((acc, v) => acc + v.total, 0);
    this.gananciaTotal = 0;
    this.costoVentas = 0;

    ventas.forEach(v => {
      v.detalles.forEach((d: any) => {
        // d.producto.precio es el PRECIO DE COMPRA (costo)
        this.costoVentas += (d.producto.precioCompra * d.cantidad);
        const beneficio = (d.precioVenta - d.producto.precioCompra) * d.cantidad;
        this.gananciaTotal += beneficio;
      });
    });

    // Calcular % de margen: (Ganancia / Ingresos) * 100
    this.margenPorcentaje = this.ingresosTotales > 0 
      ? (this.gananciaTotal / this.ingresosTotales) * 100 
      : 0;

    // Actualizar las tarjetas
    this.actualizarCards();
  }

  actualizarCards() {
    this.stats = [
      { label: 'Ventas Totales', value: `$${this.ingresosTotales.toLocaleString()}`, icon: 'bi-currency-dollar', color: 'purple' },
      { label: 'Ganancia Bruta', value: `$${this.gananciaTotal.toLocaleString()}`, icon: 'bi-cash-coin', color: 'emerald' },
      // Aquí podrías añadir otras como "Clientes Activos" o "Stock Crítico"
    ];
  }
}
  


