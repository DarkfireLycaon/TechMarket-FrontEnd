import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Proveedor } from '../../../core/proveedor/proveedor';

import { Router, RouterLink } from '@angular/router';
import { ProveedorService } from '../../../core/proveedor.service';

@Component({
  selector: 'app-proveedor-lista',
  imports: [CommonModule, RouterLink],
  templateUrl: './proveedor-lista.html',
  styleUrl: './proveedor-lista.css',
})
export class ProveedorLista {
proveedores: Proveedor[] = [];
private proveedorServicio = inject(ProveedorService);
private cdref = inject(ChangeDetectorRef);
private enrutador = inject(Router);

ngOnInit(){
  this.obtenerProveedores();
}
private obtenerProveedores(){
  this.proveedorServicio.obtenerProveedorLista().subscribe(
    data=>{
      this.proveedores = data;
      this.cdref.detectChanges();
    }
  )
}
editarProveedor(id: number){
this.enrutador.navigate(['editar-proveedor', id]);
}
eliminarProveedor(id: number){
 this.proveedorServicio.eliminarProveedor(id).subscribe({
    next:(datos) => this.obtenerProveedores(),
    error: (errores) => console.log(errores)
  });
}

}
