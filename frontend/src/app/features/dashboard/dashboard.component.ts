import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  resumen = { totalVentas: 0, totalStock: 0, totalProductos: 0, totalReportes: 0 };
  ventasSemanales: any[] = [];
  ventasPorCategoria: any[] = [];
  maxVentaSemanal = 0;
  maxVentaCategoria = 0;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dashboardService.obtenerDashboard().subscribe({
      next: (data: any) => {
        this.resumen = data.resumen;
        this.ventasSemanales = data.ventasSemanales;
        this.ventasPorCategoria = data.ventasPorCategoria;
        this.maxVentaSemanal = Math.max(...this.ventasSemanales.map((v: any) => v.total), 1);
        this.maxVentaCategoria = Math.max(...this.ventasPorCategoria.map((v: any) => v.total), 1);
      },
      error: () => console.error('Error al cargar dashboard')
    });
  }
}