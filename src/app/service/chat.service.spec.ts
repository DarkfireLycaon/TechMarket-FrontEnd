import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { vi } from 'vitest';
import { ProductoService } from './producto.service';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  const productos = [
    { idProducto: 3, nombre: 'Laptop VivoBook 15', marca: 'ASUS', categoria: 'Laptops', precioVenta: 529.99, stock: 15 },
    { idProducto: 1, nombre: 'Laptop IdeaPad Slim 3', marca: 'Lenovo', categoria: 'Laptops', precioVenta: 579.99, stock: 18 },
    { idProducto: 2, nombre: 'Laptop Aspire 5', marca: 'Acer', categoria: 'Laptops', precioVenta: 699.99, stock: 12 },
    { idProducto: 5, nombre: 'Monitor Odyssey G5 27', marca: 'Samsung', categoria: 'Monitores', precioVenta: 369.99, stock: 9 },
    { idProducto: 13, nombre: 'SSD externo T7 1TB', marca: 'Samsung', categoria: 'Almacenamiento', precioVenta: 119.99, stock: 16 },
    { idProducto: 24, nombre: 'Tableta iPad 10.ª generación', marca: 'Apple', categoria: 'Tablets', precioVenta: 449.99, stock: 6 },
  ];
  const productoServiceStub = {
    getProductos: vi.fn().mockReturnValue(of(productos)),
  };

  let chatService: ChatService;

  beforeEach(() => {
    productoServiceStub.getProductos.mockReturnValue(of(productos));
    TestBed.configureTestingModule({
      providers: [
        ChatService,
        { provide: ProductoService, useValue: productoServiceStub },
      ],
    });
    chatService = TestBed.inject(ChatService);
  });

  it('encuentra los productos por categoria aunque la consulta sea una frase', async () => {
    const respuesta = await firstValueFrom(chatService.enviarMensaje('¿Hay stock de laptops?'));

    expect(respuesta.texto).toContain('inventario');
    expect(respuesta.productos).toHaveLength(3);
    expect(respuesta.productos[0].nombre).toBe('Laptop VivoBook 15');
    expect(respuesta.productos[0].stockInfo).toContain('15');
  });

  it('ofrece productos de la misma marca si el modelo exacto no existe', async () => {
    const respuesta = await firstValueFrom(chatService.enviarMensaje('Precio de iPhone'));

    expect(respuesta.texto).toContain('No encontré iPhone');
    expect(respuesta.productos).toHaveLength(1);
    expect(respuesta.productos[0].nombre).toContain('iPad');
    expect(respuesta.productos[0].stockInfo).toContain('449.99');
  });

  it('interpreta una recomendacion para trabajo como una busqueda de laptops', async () => {
    const respuesta = await firstValueFrom(chatService.enviarMensaje('¿Qué me recomiendas para trabajo?'));

    expect(respuesta.texto).toContain('podrían interesarte');
    expect(respuesta.productos).toHaveLength(3);
    expect(respuesta.productos.every((producto: { nombre: string }) => producto.nombre.includes('Laptop'))).toBe(true);
  });
});