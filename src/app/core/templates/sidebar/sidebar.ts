import { Component, HostListener, OnInit, signal } from '@angular/core';
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
  private readonly categoriasDefinidas = [
    { slug: 'televisiones', name: 'Televisiones', icon: 'fas fa-tv', codes: ['TELEVISIONES'] },
    { slug: 'informatica', name: 'Informática', icon: 'fas fa-laptop', codes: ['COMPONENTES', 'ALMACENAMIENTO', 'REDES', 'MONITORES', 'PERIFERICOS'] },
    { slug: 'videojuegos', name: 'Videojuegos', icon: 'fas fa-gamepad', codes: ['VIDEOJUEGOS', 'GAMING'] },
    { slug: 'telefonia', name: 'Telefonía', icon: 'fas fa-mobile-alt', codes: ['TELEFONIA'] },
    { slug: 'electrodomesticos', name: 'Electrodomésticos', icon: 'fas fa-blender', codes: ['ELECTRODOMESTICOS'] },
    { slug: 'audio', name: 'Audio', icon: 'fas fa-headphones', codes: ['AUDIO'] },
    { slug: 'fotografia', name: 'Fotografía', icon: 'fas fa-camera', codes: ['FOTOGRAFIA', 'CAMARAS'] },
    { slug: 'smart-home', name: 'Smart Home', icon: 'fas fa-home', codes: ['SMART_HOME', 'SMART HOME'] },
    { slug: 'accesorios', name: 'Accesorios', icon: 'fas fa-plug', codes: ['ACCESORIOS'] },
    { slug: 'impresion', name: 'Impresión', icon: 'fas fa-print', codes: ['IMPRESION'] },
    { slug: 'laptops', name: 'Laptops', icon: 'fas fa-laptop', codes: ['LAPTOPS'] }
  ];
  categorias = signal(this.categoriasDefinidas.map(categoria => ({
    nombre: categoria.name,
    icono: categoria.icon,
    ruta: `/categorias/${categoria.slug}`,
    count: 0
  })));

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
          const key = cat.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
          counts[key] = (counts[key] || 0) + 1;
        }

        this.categorias.set(this.categoriasDefinidas.map(categoria => ({
          nombre: categoria.name,
          icono: categoria.icon,
          ruta: `/categorias/${categoria.slug}`,
          count: categoria.codes.reduce((total, code) => total + (counts[code] || 0), 0)
        })));
      },
      error: (err) => {
        console.error('No se pudo cargar productos para los contadores de categoría', err);
      }
    });
  }

  cerrarMenuEnMovil(): void {
    if (window.innerWidth < 992) {
      this.menuAbierto = false;
    }
  }
}