import { Component, OnInit } from '@angular/core';
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
    if (!this.isLoggedIn) {
      this.carritoItems = 0;
      return;
    }
    
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

  irAlCarrito(): void {
    this.router.navigate(['/carrito']);
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.carritoItems = 0;
    this.router.navigate(['/login']);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}