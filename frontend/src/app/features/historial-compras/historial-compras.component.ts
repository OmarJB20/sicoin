import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../core/services/venta.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-historial-compras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-compras.component.html',
  styleUrl: './historial-compras.component.css'
})
export class HistorialComprasComponent implements OnInit {

  compras: any[] = [];
  busqueda = '';
  detalleCompra: any[] = [];
  compraSeleccionada: any = null;
  cargando = false;

  constructor(private ventaService: VentaService) {}

  ngOnInit() {
    this.cargarCompras();
  }

  get comprasFiltradas() {
    if (!this.busqueda.trim()) return this.compras;
    const t = this.busqueda.toLowerCase().trim();
    return this.compras.filter(c =>
      String(c.id).includes(t) ||
      (c.estado || '').toLowerCase().includes(t)
    );
  }

  cargarCompras() {
    this.cargando = true;
    this.ventaService.listarPorCliente().subscribe({
      next: (res: any) => {
        this.compras = res;
        this.cargando = false;
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar las compras', 'error');
        this.cargando = false;
      }
    });
  }

  verDetalle(compra: any) {
    this.compraSeleccionada = compra;
    this.ventaService.detallePorCliente(compra.id).subscribe({
      next: (res: any) => { this.detalleCompra = res; },
      error: () => Swal.fire('Error', 'No se pudo cargar el detalle', 'error')
    });
  }

  calcularTotalDetalle(): number {
    return this.detalleCompra.reduce(
      (sum: number, d: any) => sum + Number(d.subtotal || 0), 0
    );
  }

  formatMoney(value: any): string {
    return Number(value || 0).toFixed(2);
  }
}
