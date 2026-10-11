import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom, of } from 'rxjs';
import { vi } from 'vitest';
import { CarritoService } from './carrito.service';
import { ProductoService } from './producto.service';
import { environment } from '../../environments/environment';

describe('CarritoService', () => {
  const guestCartKey = 'techmarket_guest_cart_v1';
  const productos = [
    { idProducto: 13, nombre: 'SSD externo T7 1TB', precioVenta: 119.99, precioOferta: 99.99, esOferta: true, stock: 16 },
  ];
  const productoServiceStub = {
    getProductos: vi.fn().mockReturnValue(of(productos)),
  };

  let carritoService: CarritoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem('token');
    localStorage.removeItem(guestCartKey);
    productoServiceStub.getProductos.mockReturnValue(of(productos));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CarritoService,
        { provide: ProductoService, useValue: productoServiceStub },
      ],
    });
    carritoService = TestBed.inject(CarritoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('token');
    localStorage.removeItem(guestCartKey);
  });

  it('guarda productos invitados y calcula el total con el precio de oferta', async () => {
    await firstValueFrom(carritoService.agregarProducto(13, 2));
    const carrito = await firstValueFrom(carritoService.obtenerCarrito());

    expect(carrito.items).toHaveLength(1);
    expect(carrito.items[0].precioUnitario).toBe(99.99);
    expect(carrito.items[0].subtotal).toBe(199.98);
    expect(carrito.total).toBe(199.98);
  });

  it('sincroniza el carrito local al iniciar sesión', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem(guestCartKey, JSON.stringify([{ productoId: 13, cantidad: 2 }]));

    const sincronizacion = firstValueFrom(carritoService.sincronizarCarritoInvitado());
    const request = httpMock.expectOne(`${environment.apiUrl}/api/carrito/agregar`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ productoId: 13, cantidad: 2 });
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush({});
    await sincronizacion;

    expect(localStorage.getItem(guestCartKey)).toBeNull();
  });
});