import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
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
});
