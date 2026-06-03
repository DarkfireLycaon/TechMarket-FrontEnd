import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../../core/cliente/cliente';

import { Router } from '@angular/router';
import { ClienteService } from '../../../service/cliente-service';

@Component({
  selector: 'app-agregar-cliente',
  imports: [FormsModule],
  templateUrl: './agregar-cliente.html',
  styleUrl: './agregar-cliente.css',
})
export class AgregarCliente {
cliente: Cliente = new Cliente();
private clienteServicio = inject(ClienteService)
private enrutador = inject(Router);

onSubmit(){
  this.guardarCliente();

  
}
guardarCliente(){
  this.clienteServicio.agregarCliente(this.cliente).subscribe({
    next:(datos)=>{
      this.irListaClientes();
    },
     error: (error: any) =>{
     console.log(error)
     }
  });
}
irListaClientes(){
  this.enrutador.navigate(['/clientes']);
}

}
