import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../service/pedido.service';
import { Chart, registerables } from 'chart.js';

// Esto registra todos los componentes necesarios (incluyendo 'line')
Chart.register(...registerables);
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [BaseChartDirective, CommonModule],
  templateUrl: './admin-dashboard.html'
})
export class AdminDashboard implements OnInit {
  // Datos simulados (luego los reemplazaremos con la llamada al servicio)
  totalVentas = 12500.50;
  pedidosPendientes = 8;
  productosBajoStock = 3;
  categoriaTop = 'Gaming';        // <--- NUEVO
  usuariosRegistrados = 142;
constructor(private pedidoService: PedidoService, private cdr: ChangeDetectorRef){}
  public chartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [{
      data: [1200, 1900, 3000, 2500, 3200, 4000, 3800],
      label: 'Ventas ($)',
      fill: true,
      tension: 0.4,
      borderColor: '#0d6efd',
      backgroundColor: 'rgba(13, 110, 253, 0.1)'
    }]
  };

  public chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false
  };

ngOnInit() {
    this.pedidoService.obtenerResumenDashboard().subscribe({
      next: (data: any) => {
        this.totalVentas = data.totalVentas;
        this.pedidosPendientes = data.pedidosPendientes;
        this.productosBajoStock = data.productosBajoStock;
        this.categoriaTop = data.categoriaTop;
        this.usuariosRegistrados = data.usuariosRegistrados;
        this.cdr.detectChanges();
        // Opcional: Aquí podrías actualizar el gráfico con data.ventasUltimos7Dias
      },
      error: (err) => console.error('Error al cargar dashboard:', err)
    });
  }
}