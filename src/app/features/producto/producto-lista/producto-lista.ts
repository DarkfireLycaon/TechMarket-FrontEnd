import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductoService } from '../../../core/producto.service';
import { Producto } from '../../../core/producto/producto';

@Component({
  selector: 'app-producto-lista',
  imports: [CommonModule, RouterLink],
  templateUrl: './producto-lista.html',
  styleUrl: './producto-lista.css',
})
export class ProductoLista implements OnInit {
 productos: Producto[] =[];
 private productoServicio = inject(ProductoService);
 private cdRef = inject(ChangeDetectorRef); // 2. Inyéctalo aquí
private enrutador = inject(Router);
 ngOnInit(){
  //cargar los productos
  this.obtenerProductos();
 }
 private obtenerProductos(): void{
  this.productoServicio.obtenerProductosLista().subscribe(
    data=>{
      this.productos = data;
      console.log(this.productos);
      this.cdRef.detectChanges(); // 3. ¡FUERZA A ANGULAR A PINTAR!
    }
    
  );
 }
editarProducto(id: number){
this.enrutador.navigate(['editar-producto', id]);
}
eliminarProducto(id:number){
  this.productoServicio.eliminarProducto(id).subscribe({
    next:(datos) => this.obtenerProductos(),
    error: (errores) => console.log(errores)
  });
}
}
