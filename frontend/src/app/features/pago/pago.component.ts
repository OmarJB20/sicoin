import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CarritoService, CarritoItem } from '../../core/services/carrito.service';
import { VentaService } from '../../core/services/venta.service';
import { FacturaService } from '../../core/services/factura.service';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pago.component.html',
  styleUrl: './pago.component.css'
})
export class PagoComponent implements OnInit {
  items: CarritoItem[] = [];
  total = 0;
  rolId: number | null = null;

  metodoSeleccionado: string | null = null;

  formFactura: any = {
    nombre_cliente: '',
    cedula_ruc: '',
    direccion: '',
    correo: '',
    telefono: ''
  };

  constructor(
    private carritoService: CarritoService,
    private ventaService: VentaService,
    private facturaService: FacturaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.items = this.carritoService.obtenerItems();
    this.total = this.carritoService.obtenerTotal();

    const user: any = this.authService.getUser();
    this.rolId = user?.rol_id ?? null;

    if (this.items.length === 0) {
      this.router.navigate(['/catalogo']);
    }
  }

  get formularioCompleto(): boolean {
    return !!(
      this.formFactura.nombre_cliente.trim() &&
      this.formFactura.cedula_ruc.trim() &&
      this.formFactura.direccion.trim() &&
      this.formFactura.correo.trim() &&
      this.formFactura.telefono.trim()
    );
  }

  seleccionarMetodo(metodo: string) {
    if (this.rolId === 4) {
      this.metodoSeleccionado = metodo;
    } else {
      this.pagar(metodo);
    }
  }

  cancelarFactura() {
    this.metodoSeleccionado = null;
    this.formFactura = {
      nombre_cliente: '',
      cedula_ruc: '',
      direccion: '',
      correo: '',
      telefono: ''
    };
  }

  generarFactura() {
    if (!this.formularioCompleto) return;

    const productos = this.items.map(item => ({
      producto_id: item.producto_id,
      cantidad: item.cantidad
    }));

    const data = {
      productos,
      nombre_cliente: this.formFactura.nombre_cliente.trim(),
      cedula_ruc: this.formFactura.cedula_ruc.trim(),
      direccion: this.formFactura.direccion.trim(),
      correo: this.formFactura.correo.trim(),
      telefono: this.formFactura.telefono.trim(),
      metodo_pago: this.metodoSeleccionado
    };

    this.facturaService.crear(data).subscribe({
      next: () => {
        Swal.fire({
          title: 'Factura Generada',
          text: 'La factura fue registrada exitosamente. El bodeguero procesará la salida.',
          icon: 'success',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#0f7c75'
        }).then(() => {
          this.carritoService.limpiar();
          this.items = [];
          this.total = 0;
          this.metodoSeleccionado = null;
          this.formFactura = {
            nombre_cliente: '',
            cedula_ruc: '',
            direccion: '',
            correo: '',
            telefono: ''
          };
          this.router.navigate(['/catalogo']);
        });
      },
      error: (err) => {
        Swal.fire('Error', err.error?.mensaje || 'No se pudo generar la factura', 'error');
      }
    });
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
