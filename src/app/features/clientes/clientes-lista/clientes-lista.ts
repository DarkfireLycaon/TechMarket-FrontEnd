import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Cliente } from '../../../core/cliente/cliente';
import { ClienteService } from '../../../core/cliente-service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clientes-lista',
  imports: [CommonModule, RouterLink],
  templateUrl: './clientes-lista.html',
  styleUrl: './clientes-lista.css',
})
export class ClientesLista {
clientes: Cliente[] = [];
private clienteServicio = inject(ClienteService);
private cdref = inject(ChangeDetectorRef);
private enrutador = inject(Router);

ngOnInit(){
  this.obtenerClientes();

}
private obtenerClientes(){
  this.clienteServicio.obtenerClienteLista().subscribe(
    data =>{
      this.clientes = data;
      this.cdref.detectChanges();
    }
  )
}
editarCliente(id: number){
  this.enrutador.navigate(['editar-cliente', id]);
}
eliminarCliente(id:number){
this.clienteServicio.eliminarCliente(id).subscribe({
    next:(datos) => this.obtenerClientes(),
    error: (errores) => console.log(errores)
  });
}
}
