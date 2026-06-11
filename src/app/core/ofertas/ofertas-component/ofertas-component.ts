import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Producto } from '../../producto/producto';
import { ProductoService } from '../../../service/producto.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { SafeImageDirective } from '../../../directives/safe-image.directive';

@Component({
  selector: 'app-ofertas-component',
  imports: [CommonModule, CurrencyPipe, SafeImageDirective],
  templateUrl: './ofertas-component.html',
  styleUrl: './ofertas-component.css',
})
export class OfertasComponent implements OnInit {
  productosOferta: Producto[] = [];

  // La forma correcta de inyectar
  constructor(
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.productoService.getOfertas().subscribe({
      next: (data) => {
        this.productosOferta = data;
        // Obliga a Angular a actualizar la vista inmediatamente
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error("Error al cargar ofertas", err)
    });
  }
}