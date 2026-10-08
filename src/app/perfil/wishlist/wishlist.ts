import { Component, OnInit, inject, ChangeDetectorRef, Inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';

import Swal from 'sweetalert2';
import { wishlistService } from '../../service/wishlist-service';

@Component({
  selector: 'app-wishlist-perfil',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, RouterModule],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css'
})
export class wishlist implements OnInit {
  wishlistItems: any[] = [];
  cargando: boolean = true;

  private wishlistService = inject(wishlistService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router); // <- Corregido a minúscula para usar inject()

  ngOnInit(): void {
    this.cargarWishlist();
  }
  
  // ... resto de tus métodos

  cargarWishlist() {
    this.wishlistService.getWishlist().subscribe({
      next: (data) => {
        this.wishlistItems = Array.isArray(data) ? data : [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar la lista de deseos', err);
        this.wishlistItems = [];
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

eliminarDeWishlist(idWishlist: number) {
  console.log("ID de wishlist a eliminar:", idWishlist);
  
  this.wishlistService.removeFromWishlist(idWishlist).subscribe({
    next: () => {
      // Filtramos por 'id' que es la clave principal del elemento de la wishlist
      this.wishlistItems = this.wishlistItems.filter(
        item => item.id !== idWishlist && item.productId !== idWishlist && item.idProducto !== idWishlist
      );
      this.cdr.detectChanges();
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'Producto eliminado de tu lista de deseos',
        timer: 1500,
        showConfirmButton: false
      });
    },
    error: (err) => {
      console.error("Error al eliminar:", err);
      Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
    }
  });
}
   verDetalle(prod: any) {
    const id = prod?.idProducto; 
    if (id) {
      this.router.navigate(['/detalle', id]);
    } else {
      console.error("No se pudo obtener el idProducto", prod);
    }
  }
  
}