import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Proveedor } from '../../../core/proveedor/proveedor';
import { ProveedorService } from '../../../core/proveedor.service';

@Component({
  selector: 'app-editar-proveedor',
  imports: [FormsModule],
  templateUrl: './editar-proveedor.html',
  styleUrl: './editar-proveedor.css',
})
export class EditarProveedor {
proveedor: Proveedor = new Proveedor();
id: number = 0;
private proveedorService = inject(ProveedorService);
private enrutador = inject(Router);
private ruta = inject(ActivatedRoute);
private cdref = inject(ChangeDetectorRef);

ngOnInit(){
  this.id = this.ruta.snapshot.params['id'];
  this.proveedorService.obtenerProveedorPorId(this.id).subscribe({
next: (datos) => {
        this.proveedor = datos;
        console.log("Producto cargado para editar:", this.proveedor);
        
        this.cdref.detectChanges(); 
      },
      error: (errores: any) => console.log(errores)
    });
  }
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
