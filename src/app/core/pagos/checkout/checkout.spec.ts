import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER, of } from 'rxjs';
import { vi } from 'vitest';
import { Checkout } from './checkout';
import { AuthService } from '../../../service/auth';
import { CarritoService } from '../../../service/carrito.service';
import { PedidoService } from '../../../service/pedido.service';

describe('Checkout', () => {
  let fixture: ComponentFixture<Checkout>;
  let component: Checkout;
  let carritoService: { obtenerCarrito: ReturnType<typeof vi.fn> };
  let pedidoService: {
    crearPedido: ReturnType<typeof vi.fn>;
    crearPedidoInvitado: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    carritoService = {
      obtenerCarrito: vi.fn().mockReturnValue(of({ items: [], total: 0 })),
    };
    pedidoService = {
      crearPedido: vi.fn().mockReturnValue(NEVER),
      crearPedidoInvitado: vi.fn().mockReturnValue(NEVER),
    };

    TestBed.configureTestingModule({
      imports: [Checkout],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { getToken: () => null } },
        { provide: CarritoService, useValue: carritoService },
        { provide: PedidoService, useValue: pedidoService },
      ],
    });

    fixture = TestBed.createComponent(Checkout);
    component = fixture.componentInstance;
    component.cliente = {
      nombre: 'Cliente de prueba',
      email: 'cliente@example.com',
      telefono: '555123456',
      codigoPostal: '28001',
      direccion: 'Calle Mayor 1',
      ciudad: 'Madrid',
      notas: '',
    };
    component.carritoCargando = false;
  });

  it('verifica el carrito autenticado y crea el pedido sin enviar artículos locales', () => {
    carritoService.obtenerCarrito.mockReturnValue(of({
      items: [{ productoId: 13, cantidad: 2 }],
      total: 199.98,
    }));
    component.esInvitado = false;

    component.procesarPago();

    expect(carritoService.obtenerCarrito).toHaveBeenCalledOnce();
    expect(pedidoService.crearPedido).toHaveBeenCalledOnce();
    expect(pedidoService.crearPedido).toHaveBeenCalledWith({
      direccionEnvio: 'Calle Mayor 1, Madrid (CP: 28001)',
      metodoPago: 'STRIPE',
    });
    expect(pedidoService.crearPedidoInvitado).not.toHaveBeenCalled();
  });

  it('crea el pedido invitado con los artículos y cantidades del carrito local', () => {
    carritoService.obtenerCarrito.mockReturnValue(of({
      items: [{ productoId: 13, producto: { idProducto: 13 }, cantidad: 2 }],
      total: 199.98,
    }));
    component.esInvitado = true;

    component.procesarPago();

    expect(pedidoService.crearPedidoInvitado).toHaveBeenCalledOnce();
    expect(pedidoService.crearPedidoInvitado).toHaveBeenCalledWith(expect.objectContaining({
      nombre: 'Cliente de prueba',
      email: 'cliente@example.com',
      metodoPago: 'STRIPE',
      items: [{ productoId: 13, cantidad: 2 }],
    }));
    expect(pedidoService.crearPedido).not.toHaveBeenCalled();
  });

  it('no crea un pedido de cuenta si el carrito del servidor está vacío', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.esInvitado = false;

    component.procesarPago();

    expect(pedidoService.crearPedido).not.toHaveBeenCalled();
    expect(pedidoService.crearPedidoInvitado).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('carrito de tu cuenta está vacío'));
    alertSpy.mockRestore();
  });
});
