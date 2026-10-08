import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductoService } from '../../../service/producto.service';

@Component({
  selector: 'app-sidebar-categorias',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class sidebar implements OnInit {
  categorias: Array<any> = [];

  menuAbierto = false;

  constructor(private productoService: ProductoService) { }

  ngOnInit(): void {
    this.menuAbierto = window.innerWidth >= 992;
    this.cargarCategoriasConContador();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 992) {
      this.menuAbierto = true;
    }
  }

  toggleCategorias(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  // Cargar categorías dinámicamente y contadores a partir de los productos
  cargarCategoriasConContador(): void {
    this.productoService.getProductos().subscribe({
      next: (productos: any[]) => {
        const counts: Record<string, number> = {};
        for (const p of productos || []) {
          const cat = (p.categoria || '').toString().toUpperCase();
          if (!cat) continue;
          counts[cat] = (counts[cat] || 0) + 1;
        }

        const mapping: Record<string, any> = {
          TELEFONIA: { nombre: 'Telefonía', icono: 'fas fa-mobile-alt', ruta: '/categorias/telefonia' },
          INFORMATICA: { nombre: 'Informática', icono: 'fas fa-laptop', ruta: '/categorias/informatica' },
          GAMING: { nombre: 'Videojuegos', icono: 'fas fa-gamepad', ruta: '/categorias/videojuegos' },
          HOGAR: { nombre: 'Electrodomésticos', icono: 'fas fa-blender', ruta: '/categorias/electrodomesticos' },
          AUDIO: { nombre: 'Audio', icono: 'fas fa-headphones', ruta: '/categorias/audio' },
          ELECTRONICA: { nombre: 'Accesorios', icono: 'fas fa-plug', ruta: '/categorias/accesorios' }
        };

        const categorias: any[] = [];
        // Añadir categorías conocidas con su contador
        for (const key of Object.keys(mapping)) {
          categorias.push({ ...mapping[key], count: counts[key] || 0 });
          delete counts[key];
        }

        // Cualquier categoría restante la añadimos genérica
        for (const key of Object.keys(counts)) {
          categorias.push({ nombre: key, icono: 'fas fa-tag', ruta: `/categorias/${key.toLowerCase()}`, count: counts[key] });
        }

        this.categorias = categorias;
      },
      error: (err) => {
        console.error('No se pudo cargar productos para los contadores de categoría', err);
        // Fallback: mantener lista vacía o una lista fija si se desea
        this.categorias = [];
      }
    });
  }

  // Cargar categorías dinámicamente y contadores
  ngAfterViewInit(): void {
    // Intentamos usar el servicio si está disponible
    try {
      const injector = (window as any).ng && (window as any).ng.getInjector ? (window as any).ng.getInjector(document.querySelector('app-root')) : null;
      // Si no hay injector (app empaquetada), fallback: no hacer nada
      if (!injector) return;
      const productoService: ProductoService = injector.get(ProductoService);
      // Suponemos que el backend expone /api/public/categorias o similar
      productoService.getProductos().subscribe(() => {
        // no-op sólo para asegurar que el servicio está inicializado
      });
    } catch (e) {
      // no hacer nada si no se puede inyectar
      console.warn('No se pudo inicializar categorías dinámicas:', e);
    }
  }

  cerrarMenuEnMovil(): void {
    if (window.innerWidth < 992) {
      this.menuAbierto = false;
    }
  }
}