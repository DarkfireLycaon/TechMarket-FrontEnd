import { Component, OnInit, inject } from '@angular/core'; // Añadimos inject
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../service/auth';
import { CarritoService } from '../../../service/carrito.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class NavbarComponent implements OnInit {
  // Inyectamos servicios
  authService = inject(AuthService);
  private carritoService = inject(CarritoService);
  private router = inject(Router);

  // Exponemos el signal directamente
  user = this.authService.currentUserSignal; 
  
  searchTerm = '';
  carritoItems = 0;
  isMenuOpen = false;

  ngOnInit(): void {
  
    
    this.carritoService.carritoActualizado$.subscribe(() => {
      this.actualizarCarrito();
    });
  }

  actualizarCarrito(): void {
    // Si no hay usuario en el signal, el carrito es 0
    if (!this.user()) {
      this.carritoItems = 0;
      return;
    }
    
    this.carritoService.obtenerCarrito().subscribe({
      next: (carrito) => this.carritoItems = carrito.items?.length || 0,
      error: () => this.carritoItems = 0
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  buscarProductos(): void {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/productos/buscar'], { queryParams: { q: this.searchTerm } });
      this.searchTerm = '';
      this.isMenuOpen = false;
    }
  }

  toggleMenu(): void { this.isMenuOpen = !this.isMenuOpen; }
  irAlCarrito(): void { this.router.navigate(['/carrito']); }
}