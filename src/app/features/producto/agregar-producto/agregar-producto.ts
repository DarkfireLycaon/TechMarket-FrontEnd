import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { ProductoService } from '../../../core/producto.service';
import { Producto } from '../../../core/producto/producto';

@Component({
  selector: 'app-agregar-producto',
  imports: [FormsModule],
  templateUrl: './agregar-producto.html',
  styleUrl: './agregar-producto.css',
})
export class AgregarProducto {
producto: Producto = new Producto();

private productoServicio = inject(ProductoService);
private enrutador = inject(Router);

onSubmit(){
  this.guardarProducto();
}
guardarProducto(){
  this.productoServicio.agregarProducto(this.producto).subscribe({
    next:(datos)=>{
      this.irListaProductos();
    },
    error: (error: any) =>{
     console.log(error)
    }
  });
}
irListaProductos(){
this.enrutador.navigate(['/productos']);
}
}
