import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../../producto.service';

@Component({
  selector: 'app-buscar-productos',
  templateUrl: './buscar-productos.html'
})
export class BuscarProductos implements OnInit {
  productos: any[] = [];
  terminoBusqueda = '';

  constructor(
    private route: ActivatedRoute,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.terminoBusqueda = params['q'] || '';
      this.buscar();
    });
  }

  buscar(): void {
    if (this.terminoBusqueda) {
      this.productoService.buscarProductos(this.terminoBusqueda).subscribe({
        next: (data) => this.productos = data,
        error: (err) => console.error(err)
      });
    }
  }
}