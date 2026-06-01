import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../core/producto.service';

@Component({
  selector: 'app-ofertas',
  templateUrl: './ofertas.html',
  styleUrls: ['./ofertas.css'],
  standalone: true,
  imports: [CommonModule]
})
export class Ofertas implements OnInit {
  productosOferta: any[] = [];

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarOfertas();
  }

  cargarOfertas(): void {
    // Productos con descuento (puedes filtrar por un campo "enOferta")
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productosOferta = data.filter((p: any) => p.enOferta === true).slice(0, 10);
      }
    });
  }
}