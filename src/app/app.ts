import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, RouterModule, Router } from '@angular/router';
import { AuthService } from './service/auth';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "./core/templates/navbar/navbar";
import { sidebar } from "./core/templates/sidebar/sidebar";

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    RouterModule,
    CommonModule,
    NavbarComponent,
    sidebar
],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('inventario-app');
  localStorage = localStorage;
  private router = inject(Router); 
  public authService = inject(AuthService);

  ngOnInit(): void {
    // Verificar sesión al iniciar
    this.verificarSesion();
  }

  verificarSesion(): void {
    // Puedes agregar lógica adicional aquí si es necesario
    const token = localStorage.getItem('token');
    if (!token) {
      // No hay sesión, redirigir a login si es necesario
      console.log('No hay sesión activa');
    }
  }

  onLogout(): void {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: "Tendrás que ingresar tus credenciales nuevamente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6f42c1',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        // Limpiar almacenamiento
        localStorage.clear();
        
        // Navegar al login y recargar
        this.router.navigate(['/login']).then(() => {
          window.location.reload();
        });
      }
    });
  }
}