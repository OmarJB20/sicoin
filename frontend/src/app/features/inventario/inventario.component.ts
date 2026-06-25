import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../core/services/producto.service';
import { MovimientoService } from '../../core/services/movimiento.service';
import { AuthService } from '../../core/services/auth.service';
import { EstadisticaService } from '../../core/services/estadistica.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit {

  productos: any[] = [];
  movimientos: any[] = [];
  estadisticas: any[] = [];
  formMovimiento: any = { producto_id: '', tipo_movimiento: 'ENTRADA', cantidad: '', observacion: '' };
  tipoMovimientoActual: string = 'ENTRADA';

  constructor(
    private productoService: ProductoService,
    private movimientoService: MovimientoService,
    private authService: AuthService,
    private estadisticaService: EstadisticaService
  ) {}

  ngOnInit() {
    this.cargarProductos();
    this.cargarMovimientos();
    this.cargarEstadisticas();
  }

  cargarProductos() {
    this.productoService.listar().subscribe({
      next: (res: any) => { this.productos = res; },
      error: () => Swal.fire('Error', 'No se pudieron cargar los productos', 'error')
    });
  }

  cargarMovimientos() {
    this.movimientoService.listar().subscribe({
      next: (res: any) => { this.movimientos = res; },
      error: () => Swal.fire('Error', 'No se pudieron cargar los movimientos', 'error')
    });
  }

  cargarEstadisticas() {
    this.estadisticaService.obtenerEstadisticas().subscribe({
      next: (res: any) => { this.estadisticas = res; },
      error: () => {}
    });
  }

  getStats(productoId: number): any {
    return this.estadisticas.find(e => e.id === productoId) || {};
  }

  abrirModalMovimiento(tipo: string) {
    this.tipoMovimientoActual = tipo;
    this.formMovimiento = { producto_id: '', tipo_movimiento: tipo, cantidad: '', observacion: '' };
  }

  guardarMovimiento() {
    if (!this.formMovimiento.producto_id || !this.formMovimiento.cantidad) {
      Swal.fire('Error', 'Producto y cantidad son obligatorios', 'error');
      return;
    }
    const user: any = this.authService.getUser();
    const data = {
      producto_id: Number(this.formMovimiento.producto_id),
      usuario_id: user?.id,
      tipo_movimiento: this.formMovimiento.tipo_movimiento,
      cantidad: Number(this.formMovimiento.cantidad),
      observacion: this.formMovimiento.observacion?.trim() || ''
    };

    this.movimientoService.registrar(data).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Éxito', text: 'Movimiento registrado', timer: 1500, showConfirmButton: false });
        this.cerrarModal('btnCerrarModalMovimiento');
        this.cargarMovimientos();
        this.cargarProductos();
      },
      error: (err) => Swal.fire('Error', err.error?.mensaje || 'Error al registrar movimiento', 'error')
    });
  }

  cerrarModal(id: string) {
    document.getElementById(id)?.click();
  }
}
