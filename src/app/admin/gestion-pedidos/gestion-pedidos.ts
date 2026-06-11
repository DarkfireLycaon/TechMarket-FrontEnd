import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../service/pedido.service';


@Component({
  selector: 'app-gestion-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-pedidos.html',
  styleUrl: './gestion-pedidos.css',
})
export class GestionPedidos implements OnInit {
  pedidos: any[] = [];
  pedidoSeleccionado: any = null;
  cargando: boolean = false;
  
  // 💡 Tip: Cambia esto a false para probar cómo lo vería un cliente común
  esAdmin: boolean = true; 
  
  constructor(private pedidoService: PedidoService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.cargando = true;

    // Evaluamos el rol para decidir qué método de tu PedidoService invocar
    const peticion = this.esAdmin 
      ? this.pedidoService.obtenerTodosPedidosAdmin() 
      : this.pedidoService.obtenerMisPedidos();

    peticion.subscribe({
     
      next: (data) => {
        
        this.pedidos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      
      error: (err) => {
        console.error('Error al cargar la lista de pedidos:', err);
        this.cargando = false;
        
      }
    });
  }

  verDetalles(pedidoId: number): void {
    // Evitamos traer relaciones pesadas en la lista; cargamos el detalle solo bajo demanda
    this.pedidoService.obtenerPedido(pedidoId).subscribe({
      next: (detalle) => {
        this.pedidoSeleccionado = detalle;
      },
      error: (err) => console.error('Error al obtener el detalle del pedido:', err)
    });
  }

  cerrarDetalles(): void {
    this.pedidoSeleccionado = null;
  }

  cambiarEstado(pedidoId: number, nuevoEstado: string): void {
    this.pedidoService.actualizarEstadoAdmin(pedidoId, nuevoEstado).subscribe({
      next: (res) => {
        console.log(res.mensaje);
        // Modificación reactiva local para no tener que refrescar toda la lista desde el servidor
        const pedido = this.pedidos.find(p => p.id === pedidoId);
        if (pedido) {
          pedido.estado = nuevoEstado;
        }
      },
      error: (err) => console.error('Error al actualizar el estado de la orden:', err)
    });
  }
}