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
          const cat = (p.categoria || '').toString().trim();
          if (!cat) continue;
          // normalizamos a mayúsculas para el lookup
          const key = cat.toUpperCase();
          counts[key] = (counts[key] || 0) + 1;
        }

        // Definimos la lista oficial de categorías del sidebar con su slug y código en BD
        const specs = [
          { slug: 'televisiones', name: 'Televisiones', icon: 'fas fa-tv', code: 'TELEVISIONES' },
          { slug: 'informatica', name: 'Informática', icon: 'fas fa-laptop', code: 'INFORMATICA' },
          { slug: 'videojuegos', name: 'Videojuegos', icon: 'fas fa-gamepad', code: 'GAMING' },
          { slug: 'telefonia', name: 'Telefonía', icon: 'fas fa-mobile-alt', code: 'TELEFONIA' },
          { slug: 'electrodomesticos', name: 'Electrodomésticos', icon: 'fas fa-blender', code: 'HOGAR' },
          { slug: 'audio', name: 'Audio', icon: 'fas fa-headphones', code: 'AUDIO' },
          { slug: 'fotografia', name: 'Fotografía', icon: 'fas fa-camera', code: 'ELECTRONICA' },
          { slug: 'smart-home', name: 'Smart Home', icon: 'fas fa-home', code: 'HOGAR' },
          { slug: 'accesorios', name: 'Accesorios', icon: 'fas fa-plug', code: 'ELECTRONICA' },
          { slug: 'impresion', name: 'Impresión', icon: 'fas fa-print', code: 'INFORMATICA' }
        ];

        const categorias = specs.map(s => ({
          nombre: s.name,
          icono: s.icon,
          ruta: `/categorias/${s.slug}`,
          count: counts[s.code] || 0
        }));

        // Opcional: añadir categorías extras detectadas en products pero no listadas
        const extraKeys = Object.keys(counts).filter(k => !specs.some(s => s.code === k));
        for (const k of extraKeys) {
          const slug = k.toLowerCase().replace(/\s+/g, '-');
          categorias.push({ nombre: k.charAt(0) + k.slice(1).toLowerCase(), icono: 'fas fa-tag', ruta: `/categorias/${slug}`, count: counts[k] });
        }

        this.categorias = categorias;
      },
      error: (err) => {
        console.error('No se pudo cargar productos para los contadores de categoría', err);
        // Fallback: lista mínima estática para evitar interfaz vacía
        this.categorias = [
          { nombre: 'Informática', icono: 'fas fa-laptop', ruta: '/categorias/informatica', count: 0 },
          { nombre: 'Telefonía', icono: 'fas fa-mobile-alt', ruta: '/categorias/telefonia', count: 0 }
        ];
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