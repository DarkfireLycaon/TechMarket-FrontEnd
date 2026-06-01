import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Venta } from '../../../core/venta/venta';
import { VentaService } from '../../../core/venta-service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-ventas-lista',
  imports: [CommonModule, RouterLink],
  templateUrl: './ventas-lista.html',
  styleUrl: './ventas-lista.css',
})
export class VentasLista {
ventas: Venta[] = [];
  private ventaServicio = inject(VentaService);
  private cdref = inject(ChangeDetectorRef);
ventaSeleccionada: any = null; // Guardará la venta completa al hacer clic
  ngOnInit(): void {
    this.obtenerVentas();
  }

  private obtenerVentas() {
    this.ventaServicio.listarVentas().subscribe({
      next: (datos) => {
        this.ventas = datos;
        console.log(this.ventas);
        this.cdref.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }
  verDetalle(venta: any) {
    this.ventaSeleccionada = venta;
    console.log("Detalles a mostrar:", venta.detalles);
  }

  cerrarDetalle() {
    this.ventaSeleccionada = null;
  }
}
