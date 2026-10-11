import { ChangeDetectorRef, Component, OnDestroy, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../service/auth';
import { CarritoService } from '../../../service/carrito.service';
import { ProductoService } from '../../../service/producto.service';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class NavbarComponent implements OnInit, OnDestroy {
  // Inyectamos servicios
  authService = inject(AuthService);
  private carritoService = inject(CarritoService);
  private router = inject(Router);
  private productoService = inject(ProductoService);
  private cdr = inject(ChangeDetectorRef);
  private busqueda$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Exponemos el signal directamente
  user = this.authService.currentUserSignal; 
  
  searchTerm = '';
  sugerencias: any[] = [];
  mostrarSugerencias = false;
  cargandoSugerencias = false;
  carritoItems = 0;
  isMenuOpen = false;
  private usuarioEffect = effect(() => {
    this.user();
    this.actualizarCarrito();
  });

  ngOnInit(): void {
    this.carritoService.carritoActualizado$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.actualizarCarrito();
    });

    this.busqueda$.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((termino) => termino.length < 2
        ? of([])
        : this.productoService.buscarProductos(termino).pipe(
          map((respuesta: any) => Array.isArray(respuesta) ? respuesta : (respuesta?.content ?? [])),
          catchError(() => of([]))
        )),
      takeUntil(this.destroy$)
    ).subscribe((productos) => {
      this.sugerencias = this.priorizarOfertas(productos).slice(0, 6);
      this.cargandoSugerencias = false;
      this.cdr.markForCheck();
    });
  }

  actualizarCarrito(): void {
    this.carritoService.obtenerCarrito().subscribe({
      next: (carrito) => {
        this.carritoItems = carrito.items?.reduce((total: number, item: any) => total + Number(item.cantidad || 0), 0) || 0;
        this.cdr.markForCheck();
      },
      error: () => {
        this.carritoItems = 0;
        this.cdr.markForCheck();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  buscarProductos(): void {
    if (this.searchTerm.trim()) {
      this.mostrarSugerencias = false;
      this.sugerencias = [];
      this.router.navigate(['/productos/buscar'], { queryParams: { q: this.searchTerm } });
      this.searchTerm = '';
      this.isMenuOpen = false;
    }
  }

  buscarMientrasEscribe(termino: string): void {
    this.searchTerm = termino;
    const busqueda = termino.trim();
    this.mostrarSugerencias = busqueda.length >= 2;
    this.cargandoSugerencias = this.mostrarSugerencias;
    this.sugerencias = [];
    this.busqueda$.next(busqueda);
  }

  seleccionarProducto(producto: any): void {
    const id = producto?.idProducto ?? producto?.id ?? producto?.id_producto;
    this.mostrarSugerencias = false;
    if (id !== undefined && id !== null) {
      this.router.navigate(['/detalle', id]);
    }
  }

  ocultarSugerencias(): void {
    this.mostrarSugerencias = false;
  }

  esOferta(producto: any): boolean {
    return Boolean(producto?.esOferta && Number(producto?.precioOferta) > 0);
  }

  precioMostrado(producto: any): number {
    return this.esOferta(producto) ? producto.precioOferta : (producto.precioVenta ?? producto.precio ?? 0);
  }

  private priorizarOfertas(productos: any[]): any[] {
    return [...productos].sort((a, b) => Number(this.esOferta(b)) - Number(this.esOferta(a)));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.busqueda$.complete();
  }

  toggleMenu(): void { this.isMenuOpen = !this.isMenuOpen; }
  irAlCarrito(): void { this.router.navigate(['/carrito']); }
}