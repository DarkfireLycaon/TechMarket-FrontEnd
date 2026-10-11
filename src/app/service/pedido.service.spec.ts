import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PedidoService } from './pedido.service';
import { environment } from '../../environments/environment';

describe('PedidoService', () => {
  let pedidoService: PedidoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem('token');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), PedidoService],
    });
    pedidoService = TestBed.inject(PedidoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('crea el pedido invitado sin token y recibe la URL de Stripe', () => {
    const pedido = {
      nombre: 'Cliente invitado',
      email: 'cliente@example.com',
      telefono: '555123456',
      metodoPago: 'STRIPE',
      items: [{ productoId: 13, cantidad: 1 }],
    };
    let redirectUrl = '';

    pedidoService.crearPedidoInvitado(pedido).subscribe((respuesta) => {
      redirectUrl = respuesta.redirectUrl;
    });

    const request = httpMock.expectOne(`${environment.apiUrl}/api/pedidos/crear-invitado`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(pedido);
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({ redirectUrl: 'https://checkout.stripe.com/session/test' });

    expect(redirectUrl).toBe('https://checkout.stripe.com/session/test');
  });

  it('inicia Stripe para un pedido autenticado con el token del cliente', () => {
    localStorage.setItem('token', 'test-token');
    let redirectUrl = '';

    pedidoService.iniciarPagoStripe(42).subscribe((respuesta) => {
      redirectUrl = respuesta;
    });

    const request = httpMock.expectOne(`${environment.apiUrl}/api/pedidos/42/pagar-stripe`);
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush('https://checkout.stripe.com/session/auth-test');

    expect(redirectUrl).toBe('https://checkout.stripe.com/session/auth-test');
    localStorage.removeItem('token');
  });
});