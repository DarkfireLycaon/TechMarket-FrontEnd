import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // ← Agregar esta
import { FormsModule } from '@angular/forms';   // ← Agregar esta
import { RouterModule, Router } from '@angular/router';  // ← Agregar RouterModule
import { AuthService } from '../../service/auth';
import { CarritoService } from '../../carrito.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: true,
  imports: [
    CommonModule,    // ← Agregado
    FormsModule,     // ← Agregado
    RouterModule     // ← Agregado
  ]
})
export class NavbarComponent implements OnInit {

  isLoggedIn = false;
  usuarioNombre = '';
  searchTerm = '';
  carritoItems = 0;
  isMenuOpen = false;
isAdmin = false;
  constructor(
    private authService: AuthService,
    private carritoService: CarritoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verificarSesion();
    this.actualizarCarrito();
    
    // Escuchar cambios en el carrito
    this.carritoService.carritoActualizado$.subscribe(() => {
      this.actualizarCarrito();
    });
  }

  verificarSesion(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      this.usuarioNombre = usuario.nombre || 'Usuario';
      this.isAdmin = this.authService.isAdmin();
    }
  }

  actualizarCarrito(): void {
    this.carritoService.obtenerCarrito().subscribe({
      next: (carrito) => {
        this.carritoItems = carrito.items?.length || 0;
      },
      error: () => {
        this.carritoItems = 0;
      }
    });
  }

  buscarProductos(): void {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/productos/buscar'], { 
        queryParams: { q: this.searchTerm }
      });
      this.searchTerm = '';
      this.isMenuOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
  
}