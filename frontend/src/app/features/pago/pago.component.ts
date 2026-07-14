import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarritoService, CarritoItem } from '../../core/services/carrito.service';
import { VentaService } from '../../core/services/venta.service';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pago.component.html',
  styleUrl: './pago.component.css'
})
export class PagoComponent implements OnInit {
  items: CarritoItem[] = [];
  total = 0;

  constructor(
    private carritoService: CarritoService,
    private ventaService: VentaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.items = this.carritoService.obtenerItems();
    this.total = this.carritoService.obtenerTotal();

    if (this.items.length === 0) {
      this.router.navigate(['/catalogo']);
    }
  }

  pagar(metodo: string) {
    const user: any = this.authService.getUser();
    if (!user || !user.cliente_id) {
      Swal.fire('Error', 'No se pudo identificar al cliente', 'error');
      return;
    }

    const productos = this.items.map(item => ({
      producto_id: item.producto_id,
      cantidad: item.cantidad
    }));

    const venta = {
      cliente_id: user.cliente_id,
      productos
    };

    this.ventaService.registrar(venta).subscribe({
      next: () => {
        if (metodo === 'transferencia') {
          Swal.fire({
            title: '<strong>Transferencia Bancaria</strong>',
            html: `
              <div style="text-align: left; padding: 10px 20px; font-size: 14px; line-height: 2;">
                <p><strong>Banco:</strong> Banco Pichincha</p>
                <p><strong>Beneficiario:</strong> Sicoín</p>
                <p><strong>Cédula:</strong> 1712345678</p>
                <p><strong>Tipo de cuenta:</strong> Ahorros</p>
                <p><strong>Número de cuenta:</strong> 2200123456</p>
                <p><strong>Monto:</strong> $${this.total}</p>
                <p><strong>Motivo:</strong> Pago de producto</p>
              </div>
              <hr style="margin: 10px 0;">
              <p style="font-size: 13px; color: #6c757d;">Acérquese al mostrador de la tienda con su comprobante de pago.</p>
            `,
            icon: 'info',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#0f7c75'
          }).then(() => {
            this.carritoService.limpiar();
            this.items = [];
            this.total = 0;
          });
        } else {
          Swal.fire({
            title: 'Pago en Efectivo',
            text: 'Acérquese al mostrador para pagar su pedido.',
            icon: 'success',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#0f7c75'
          }).then(() => {
            this.carritoService.limpiar();
            this.items = [];
            this.total = 0;
          });
        }
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudo registrar la venta', 'error');
      }
    });
  }
}
