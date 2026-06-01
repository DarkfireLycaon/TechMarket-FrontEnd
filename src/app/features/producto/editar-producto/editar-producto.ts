import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../../core/producto/producto';
import { ProductoService } from '../../../core/producto.service';

@Component({
  selector: 'app-editar-producto',
  imports: [FormsModule],
  templateUrl: './editar-producto.html',
  
})
export class EditarProducto implements OnInit{
producto: Producto = new Producto();
id: number = 0;
private productoServicio = inject(ProductoService);
private ruta = inject(ActivatedRoute);
 private cdRef = inject(ChangeDetectorRef);
 private enrutador = inject(Router);
ngOnInit(){
  this.id = this.ruta.snapshot.params['id'];
  this.productoServicio.obtenerProductoPorId(this.id).subscribe({
next: (datos) => {
        this.producto = datos;
        console.log("Producto cargado para editar:", this.producto);
        
        // ¡ESTO ES LO QUE FALTA!
        // Le dice a Angular: "Ya tengo los datos, actualiza el HTML ahora mismo"
        this.cdRef.detectChanges(); 
      },
      error: (errores: any) => console.log(errores)
    });
   
}
onSubmit(){
this.guardarProducto();
}
guardarProducto(){
  this.productoServicio.editarProducto(this.id, this.producto).subscribe({
  next: (datos) => this.irProductoLista(),
  error: (errores) => console.log(errores)
  });
}
irProductoLista(){
this.enrutador.navigate(['/productos']);
}
}
