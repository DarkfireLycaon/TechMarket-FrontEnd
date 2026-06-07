import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../../service/producto.service';
import { HistorialService } from '../../../service/historial-service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-detalle-producto',
  imports: [CurrencyPipe],
  templateUrl: './detalle-producto.html',
  styleUrl: './detalle-producto.css',
})
export class DetalleProducto implements OnInit {
  producto: any;
  private route = inject(ActivatedRoute);
  private productoService = inject(ProductoService);
  private historialService = inject(HistorialService);

constructor(
  private cdr: ChangeDetectorRef,
  
   
){}
  ngOnInit() {
    const id = Number(this.route.snapshot.params['id']);
    
    // 1. Cargar datos del producto
    this.productoService.obtenerProductoPorId(id).subscribe(data => {
      this.producto = data;
      this.cdr.detectChanges();
      // 2. REGISTRAR VISITA (Aquí es donde se conecta con tu backend)
      this.historialService.registrarVisita(id).subscribe({
        next: () => console.log('Visita registrada en el historial'),
        error: (err) => console.error('Error al registrar visita', err)
       
      });
      
    });
      this.cdr.detectChanges();
  }

}