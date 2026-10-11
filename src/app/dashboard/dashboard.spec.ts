import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { Dashboard } from './dashboard';
import { HistorialService } from '../service/historial-service';
import { ProductoService } from '../service/producto.service';

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;
  let component: Dashboard;

  const historialServiceStub = {
    getUltimosVisitados: vi.fn().mockReturnValue(of([])),
    getRecomendaciones: vi.fn().mockReturnValue(of([])),
  };

  const productoServiceStub = {
    getOfertas: vi.fn().mockReturnValue(of([])),
    getProductos: vi.fn().mockReturnValue(of([
      { idProducto: 8, nombre: 'Mouse G502 HERO', categoria: 'Periféricos', precioVenta: 64.99, stock: 27, totalVendidos: 83 },
      { idProducto: 4, nombre: 'Monitor UltraGear 24', categoria: 'Monitores', precioVenta: 189.99, stock: 20, totalVendidos: 45 },
    ])),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        { provide: HistorialService, useValue: historialServiceStub },
        { provide: ProductoService, useValue: productoServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
  });

  it('debe forzar el render al cargar recomendaciones', () => {
    const detectSpy = vi.spyOn((component as any).cdr, 'detectChanges');

    fixture.detectChanges();

    expect(detectSpy).toHaveBeenCalled();
  });

  it('navega al detalle al hacer clic en una oferta', () => {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const event = new MouseEvent('click', { button: 0 });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    component.abrirDetalle(event, { idProducto: 13 });

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/detalle', 13]);
  });

  it('muestra productos genéricos si falla la API de recomendaciones', () => {
    historialServiceStub.getRecomendaciones.mockReturnValue(throwError(() => new Error('API no disponible')));

    fixture.detectChanges();
    fixture.detectChanges();

    expect(component.recomendacionesEstado).toBe('ok');
    expect(fixture.nativeElement.textContent).toContain('Mouse G502 HERO');
    expect(fixture.nativeElement.textContent).toContain('Monitor UltraGear 24');
  });
});
