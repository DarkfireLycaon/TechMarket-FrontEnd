import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { ProductoService } from './producto.service';

interface ProductoCatalogo {
  idProducto: number;
  nombre: string;
  marca?: string;
  categoria?: string;
  descripcion?: string;
  precioVenta: number;
  stock: number;
  esOferta?: boolean;
  destacado?: boolean;
  totalVendidos?: number;
}

interface ProductoChat {
  id: number;
  nombre: string;
  stockInfo: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private productoService = inject(ProductoService);
  private productosEnCache: ProductoCatalogo[] | null = null;
  private cacheValidaHasta = 0;

  private readonly palabrasIgnoradas = new Set([
    'hay', 'stock', 'disponible', 'disponibles', 'inventario', 'existe', 'precio', 'precios',
    'cuanto', 'cuesta', 'valor', 'costo', 'comparar', 'compara', 'comparame', 'versus', 'vs',
    'diferencia', 'entre', 'mejor', 'oferta', 'ofertas', 'descuento', 'promo', 'rebaja',
    'recomienda', 'recomiendas', 'recomendar', 'recomendacion', 'recomendaciones', 'quiero',
    'necesito', 'ayuda', 'podrias', 'puedes', 'dime', 'saber', 'sobre', 'de', 'del', 'la',
    'el', 'los', 'las', 'un', 'una', 'por', 'mi', 'me', 'tengo', 'consulta', 'producto',
    'productos', 'para', 'que', 'y', 'con', 'mostrar', 'tenemos', 'dia'
  ]);

  analizarIntencion(texto: string): 'stock' | 'precio' | 'comparacion' | 'recomendacion' | 'ofertas' | 'general' {
    const consulta = this.normalizar(texto);

    if (/\b(comparar|compara|comparame|vs|versus|diferencia)\b/.test(consulta)) return 'comparacion';
    if (/\b(oferta|ofertas|descuento|promo|rebaja)\b/.test(consulta)) return 'ofertas';
    if (/\b(precio|precios|cuanto|cuesta|valor|costo)\b/.test(consulta)) return 'precio';
    if (/\b(stock|disponible|disponibles|inventario|existe|hay|tienen)\b/.test(consulta)) return 'stock';
    if (/\b(recomienda|recomiendas|recomendar|recomendacion|recomendaciones|ideal)\b/.test(consulta)) return 'recomendacion';
    return 'general';
  }

  enviarMensaje(texto: string): Observable<any> {
    return this.obtenerCatalogo().pipe(
      map((productos) => this.responder(texto, productos)),
      catchError(() => of({ texto: 'No pude consultar el catálogo ahora. Inténtalo de nuevo en unos segundos.' }))
    );
  }

  private obtenerCatalogo(): Observable<ProductoCatalogo[]> {
    if (this.productosEnCache && Date.now() < this.cacheValidaHasta) {
      return of(this.productosEnCache);
    }

    return this.productoService.getProductos().pipe(
      timeout({ first: 8000 }),
      map((respuesta: any) => Array.isArray(respuesta) ? respuesta : (respuesta?.content ?? [])),
      map((productos: ProductoCatalogo[]) => productos),
      map((productos) => {
        this.productosEnCache = productos;
        this.cacheValidaHasta = Date.now() + 60_000;
        return productos;
      })
    );
  }

  private responder(texto: string, productos: ProductoCatalogo[]): any {
    const intencion = this.analizarIntencion(texto);
    const terminos = this.extraerTerminos(texto);

    if (intencion === 'comparacion') {
      return this.responderComparacion(texto, productos);
    }

    let coincidencias = this.buscarCoincidencias(terminos, productos);
    if (intencion === 'ofertas') {
      const productosOferta = terminos.length ? coincidencias : productos;
      coincidencias = productosOferta.filter((producto) => producto.esOferta && producto.stock > 0);
    } else if (intencion === 'recomendacion' && !terminos.length) {
      coincidencias = this.ordenarPorPopularidad(productos.filter((producto) => producto.stock > 0)).slice(0, 2);
    }

    if (!coincidencias.length) {
      const alternativas = this.buscarAlternativasPorMarca(terminos, productos);
      if (alternativas.length) {
        return {
          texto: 'No encontré iPhone en el catálogo. Estos productos Apple relacionados podrían interesarte:',
          productos: alternativas.slice(0, 3).map((producto) => this.formatearProducto(producto, intencion))
        };
      }

      const consulta = this.mostrarConsulta(texto) || texto.trim();
      return {
        texto: `No encontré productos que coincidan con "${consulta}" en el catálogo actual. Prueba con el nombre, la marca o la categoría.`
      };
    }

    const productosChat = coincidencias.slice(0, 5).map((producto) => this.formatearProducto(producto, intencion));
    const textoRespuesta = intencion === 'stock'
      ? 'Encontré estos productos en el inventario:'
      : intencion === 'precio'
        ? 'Estos son los precios de los productos encontrados:'
        : intencion === 'ofertas'
          ? 'Estas ofertas coinciden con tu búsqueda:'
          : intencion === 'recomendacion'
            ? 'Estas opciones disponibles podrían interesarte:'
            : 'Encontré estos productos en el catálogo:';

    return { texto: textoRespuesta, productos: productosChat };
  }

  private responderComparacion(texto: string, productos: ProductoCatalogo[]): any {
    const partes = this.normalizar(texto)
      .replace(/\b(comparar|compara|comparame|diferencia|entre)\b/g, ' ')
      .split(/\b(?:vs|versus|contra|y)\b|,/)
      .map((parte) => this.extraerTerminos(parte).join(' '))
      .filter(Boolean);

    if (partes.length < 2) {
      return { texto: 'Para comparar, indica dos productos, por ejemplo: “Compara Laptop Lenovo y Laptop ASUS”.' };
    }

    const [primero] = this.buscarCoincidencias(partes[0].split(' '), productos);
    const [segundo] = this.buscarCoincidencias(partes[1].split(' '), productos);
    if (!primero || !segundo) {
      return { texto: 'No encontré ambos productos en el catálogo para compararlos. Revisa los nombres o las marcas.' };
    }

    return {
      producto1: primero.nombre,
      precio1: primero.precioVenta,
      stock1: primero.stock,
      producto2: segundo.nombre,
      precio2: segundo.precioVenta,
      stock2: segundo.stock
    };
  }

  private buscarCoincidencias(terminos: string[], productos: ProductoCatalogo[]): ProductoCatalogo[] {
    if (!terminos.length) return [];

    return productos
      .map((producto) => {
        const campos = [producto.nombre, producto.marca, producto.categoria, producto.descripcion]
          .map((campo) => this.normalizar(campo ?? '').split(/[^a-z0-9]+/).filter(Boolean));
        const tokens = new Set(campos.flat());
        const coincide = terminos.every((termino) => tokens.has(termino));
        const relevancia = terminos.reduce((puntaje, termino) => {
          return puntaje + (campos[0].includes(termino) ? 3 : campos[1].includes(termino) ? 2 : 1);
        }, 0);
        return { producto, coincide, relevancia };
      })
      .filter((resultado) => resultado.coincide)
      .sort((a, b) => b.relevancia - a.relevancia || (b.producto.totalVendidos ?? 0) - (a.producto.totalVendidos ?? 0))
      .map((resultado) => resultado.producto);
  }

  private buscarAlternativasPorMarca(terminos: string[], productos: ProductoCatalogo[]): ProductoCatalogo[] {
    if (!terminos.includes('iphone')) return [];

    return productos
      .filter((producto) => this.normalizar(producto.marca ?? '') === 'apple' && producto.stock > 0)
      .sort((a, b) => (b.totalVendidos ?? 0) - (a.totalVendidos ?? 0));
  }

  private formatearProducto(producto: ProductoCatalogo, intencion: string): ProductoChat {
    const stock = producto.stock > 0 ? `Stock: ${producto.stock}` : 'Agotado';
    const precio = `Precio: ${producto.precioVenta} €`;
    return {
      id: producto.idProducto,
      nombre: producto.nombre,
      stockInfo: intencion === 'stock' ? stock : `${precio} · ${stock}`
    };
  }

  private ordenarPorPopularidad(productos: ProductoCatalogo[]): ProductoCatalogo[] {
    return [...productos].sort((a, b) => Number(b.destacado) - Number(a.destacado) || (b.totalVendidos ?? 0) - (a.totalVendidos ?? 0));
  }

  private extraerTerminos(texto: string): string[] {
    return this.normalizar(texto)
      .split(/[^a-z0-9]+/)
      .filter((termino) => termino.length > 1 && !this.palabrasIgnoradas.has(termino))
      .map((termino) => ({
        notebook: 'laptop',
        portatil: 'laptop',
        portatiles: 'laptop',
        trabajo: 'laptop',
        oficina: 'laptop',
        estudio: 'laptop'
      }[termino] ?? termino));
  }

  private mostrarConsulta(texto: string): string {
    return texto
      .split(/\s+/)
      .map((termino) => termino.replace(/[¿?¡!.,;:]/g, ''))
      .filter((termino) => {
        const normalizado = this.normalizar(termino);
        return normalizado.length > 1 && !this.palabrasIgnoradas.has(normalizado);
      })
      .join(' ');
  }

  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
}