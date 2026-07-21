import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacturaService } from '../../core/services/factura.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-facturas-pendientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './facturas-pendientes.component.html',
  styleUrl: './facturas-pendientes.component.css'
})
export class FacturasPendientesComponent implements OnInit {

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
    this.facturaService.listarPendientes().subscribe({
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

  procesarSalida(factura: any) {
    Swal.fire({
      title: '¿Procesar salida?',
      html: `
        <p>Se descontará el stock de los productos de la factura <strong>#${factura.id}</strong></p>
        <p><strong>Cliente:</strong> ${factura.nombre_cliente}</p>
        <p><strong>Total:</strong> $${factura.total}</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, procesar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0f7c75'
    }).then((result) => {
      if (result.isConfirmed) {
        this.facturaService.procesarSalida(factura.id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Salida procesada',
              text: 'El stock fue descontado correctamente',
              timer: 2000,
              showConfirmButton: false
            });
            this.cargarFacturas();
          },
          error: (err) => {
            Swal.fire('Error', err.error?.mensaje || 'No se pudo procesar la salida', 'error');
          }
        });
      }
    });
  }

  formatMoney(value: any): string {
    return Number(value || 0).toFixed(2);
  }
}
