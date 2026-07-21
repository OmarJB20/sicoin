import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacturaService } from '../../core/services/factura.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mis-facturas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-facturas.component.html',
  styleUrl: './mis-facturas.component.css'
})
export class MisFacturasComponent implements OnInit {

  facturas: any[] = [];
  facturaSeleccionada: any = null;
  detalleFactura: any[] = [];
  cargando = false;

  constructor(private facturaService: FacturaService) {}

  ngOnInit() {
    this.cargarFacturas();
  }

  cargarFacturas() {
    this.cargando = true;
    this.facturaService.listarPorUsuario().subscribe({
      next: (res: any) => {
        this.facturas = res;
        this.cargando = false;
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar las facturas', 'error');
        this.cargando = false;
      }
    });
  }

  verDetalle(factura: any) {
    this.facturaSeleccionada = factura;
    this.facturaService.obtener(factura.id).subscribe({
      next: (res: any) => {
        this.detalleFactura = res.detalle || [];
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar el detalle', 'error');
      }
    });
  }

  calcularTotalDetalle(): number {
    return this.detalleFactura.reduce(
      (sum: number, d: any) => sum + Number(d.subtotal || 0), 0
    );
  }

  getEstadoBadge(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'bg-warning text-dark';
      case 'PROCESADA': return 'bg-success';
      case 'CANCELADA': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  formatMoney(value: any): string {
    return Number(value || 0).toFixed(2);
  }
}
