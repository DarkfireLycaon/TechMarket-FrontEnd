import { Component, inject } from '@angular/core';
import { Proveedor } from '../../../core/proveedor/proveedor';

import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProveedorService } from '../../../core/proveedor.service';

@Component({
  selector: 'app-agregar-proveedor',
  imports: [FormsModule],
  templateUrl: './agregar-proveedor.html',
  styleUrl: './agregar-proveedor.css',
})
export class AgregarProveedor {
proveedor: Proveedor = new Proveedor();
private proveedorService = inject(ProveedorService);
private enrutador = inject(Router);

onSubmit(){
  this.guardarProducto();
}
guardarProducto(){
  this.proveedorService.agregarProveedor(this.proveedor).subscribe({
    next:(datos)=>{
      this.irListaProveedores();
    },
    error: (error: any) =>{
     console.log(error)
    }
  });
}
irListaProveedores(){
this.enrutador.navigate(['/proveedores']);
}


}
