import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../../../service/producto.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-buscar-productos',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './buscar-productos.html',
  // 🚀 Estrategia OnPush: el componente solo se actualiza cuando hay inputs o eventos explícitos
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class BuscarProductos implements OnInit, OnDestroy {
  productos: any[] = [];
  buscadorControl = new FormControl('');
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef // Inyectado
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const terminoInicial = params['q'] || '';
      this.buscadorControl.setValue(terminoInicial, { emitEvent: false });
      if (terminoInicial) this.ejecutarBusqueda(terminoInicial);
    });

    this.buscadorControl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(termino => this.ejecutarBusqueda(termino || ''));
  }

  ejecutarBusqueda(termino: string): void {
    if (!termino.trim()) {
      this.productos = [];
      this.cdr.markForCheck(); // Avisamos que debe actualizarse al limpiar
      return;
    }

    this.productoService.buscarProductos(termino).subscribe({
      next: (data) => {
        this.productos = data;
        // ✅ Marcamos para verificar solo cuando recibimos datos del servidor
        this.cdr.markForCheck(); 
      },
      error: (err) => console.error('Error:', err)
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}