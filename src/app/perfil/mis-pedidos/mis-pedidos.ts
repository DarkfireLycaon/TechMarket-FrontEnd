import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidoService } from '../../service/pedido.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-pedidos.html',
  styleUrls: ['./mis-pedidos.css']
})
export class MisPedidos implements OnInit {

  pedidos: any[] = [];
  cargando: boolean = true;
  procesandoCancelacion: boolean = false;

  constructor(
    private pedidoService: PedidoService,
    private cdr: ChangeDetectorRef // ✅ Inyectado para evitar bloqueos visuales
  ) { }

  ngOnInit(): void {
    this.cargarMisPedidos();
  }

  cargarMisPedidos(): void {
  this.cargando = true;
  this.cdr.detectChanges();

  this.pedidoService.obtenerMisPedidos().subscribe({
  next: (data) => {
  console.log('Datos recibidos del servidor:', data); // <-- MIRA LA CONSOLA PARA VER QUÉ RECIBES REALMENTE

  // Blindaje: Verificamos si data es realmente un array
  if (Array.isArray(data)) {
    this.pedidos = data.sort((a, b) => {
      // Usamos el ID para ordenar de forma segura
      const idA = a.pedidoId || 0;
      const idB = b.pedidoId || 0;
      return idB - idA;
    });
  } else {
    // Si el backend envió un objeto único o error, lo tratamos como lista vacía
    console.warn('El backend no devolvió una lista:', data);
    this.pedidos = [];
  }
  
  this.cargando = false;
  this.cdr.detectChanges();
},
  });
}

  cancelarPedido(pedidoId: number): void {
    // Confirmación estética antes de borrar o cancelar nada en Base de Datos
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción cancelará tu pedido de forma definitiva.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver'
    }).then((result) => {
      if (result.isConfirmed) {
        this.procesandoCancelacion = true;
        this.cdr.detectChanges(); // Bloqueamos o mostramos indicador de proceso

        this.pedidoService.cancelarPedido(pedidoId).subscribe({
          next: (res) => {
            this.procesandoCancelacion = false;
            
            // Avisamos al usuario del éxito
            Swal.fire('¡Cancelado!', 'Tu pedido ha sido cancelado con éxito.', 'success');
            
            // Refrescamos la lista llamando de nuevo a la base de datos
            this.cargarMisPedidos();
          },
          error: (err) => {
            this.procesandoCancelacion = false;
            this.cdr.detectChanges();
            console.error('Error al cancelar el pedido:', err);
            Swal.fire('Error', 'No se pudo cancelar el pedido. Revisa el backend.', 'error');
          }
        });
      }
    });
  }

  // Helper estético para pintar las etiquetas de colores según el estado que mande Spring Boot
  obtenerClaseEstado(estado: string): string {
    if (!estado) return 'badge bg-secondary';
    switch (estado.toUpperCase()) {
      case 'COMPLETADO':
      case 'PAGADO':
        return 'badge bg-success';
      case 'PENDIENTE':
        return 'badge bg-warning text-dark';
      case 'CANCELADO':
        return 'badge bg-danger';
      default:
        return 'badge bg-info';
    }
  }
}