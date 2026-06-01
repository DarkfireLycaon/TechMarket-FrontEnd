import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../../core/cliente/cliente';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from '../../../core/cliente-service';

@Component({
  selector: 'app-editar-cliente',
  imports: [FormsModule],
  templateUrl: './editar-cliente.html',
  styleUrl: './editar-cliente.css',
})
export class EditarCliente {
cliente: Cliente = new Cliente();
id: number = 0;
private clienteServicio = inject(ClienteService);
private ruta = inject(ActivatedRoute);
 private cdRef = inject(ChangeDetectorRef);
 private enrutador = inject(Router);
ngOnInit(){
  this.id = this.ruta.snapshot.params['id'];
  this.clienteServicio.obtenerClientePorId(this.id).subscribe({
next: (datos) => {
        this.cliente = datos;
        console.log("cliente cargado para editar:", this.cliente);
        
        // ¡ESTO ES LO QUE FALTA!
        // Le dice a Angular: "Ya tengo los datos, actualiza el HTML ahora mismo"
        this.cdRef.detectChanges(); 
      },
      error: (errores: any) => console.log(errores)
    });
   
}
onSubmit(){
this.guardarcliente();
}
guardarcliente(){
  this.clienteServicio.editarCliente(this.id, this.cliente).subscribe({
  next: (datos) => this.irclienteLista(),
  error: (errores) => console.log(errores)
  });
}
irclienteLista(){
this.enrutador.navigate(['/clientes']);
}
}
