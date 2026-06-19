import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../core/services/venta.service';
import { ProductoService } from '../../core/services/producto.service';
import { ClienteService } from '../../core/services/cliente.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css'
})
export class VentasComponent implements OnInit {

  ventas: any[] = [];
  productos: any[] = [];
  clientes: any[] = [];
  busqueda = '';

  formVenta: any = { cliente_id: '', productos: [] };
  detalleVenta: any[] = [];
  ventaSeleccionada: any = null;

  cargando = false;

  constructor(
    private ventaService: VentaService,
    private productoService: ProductoService,
    private clienteService: ClienteService
  ) {}

  ngOnInit() {
    this.cargarVentas();
    this.cargarProductos();
    this.cargarClientes();
  }

  get ventasFiltradas() {
    if (!this.busqueda.trim()) return this.ventas;
    const t = this.busqueda.toLowerCase().trim();
    return this.ventas.filter(v =>
      String(v.id).includes(t) ||
      `${v.nombre} ${v.apellido}`.toLowerCase().includes(t) ||
      String(v.num_productos || 0).includes(t) ||
      (v.estado || '').toLowerCase().includes(t)
    );
  }

  cargarVentas() {
    this.ventaService.listar().subscribe({
      next: (res: any) => { this.ventas = res; },
      error: () => Swal.fire('Error', 'No se pudieron cargar las ventas', 'error')
    });
  }

  cargarProductos() {
    this.productoService.listar().subscribe({
      next: (res: any) => { this.productos = res; },
      error: () => Swal.fire('Error', 'No se pudieron cargar los productos', 'error')
    });
  }

  cargarClientes() {
    this.clienteService.listar().subscribe({
      next: (res: any) => { this.clientes = res; },
      error: () => Swal.fire('Error', 'No se pudieron cargar los clientes', 'error')
    });
  }

  abrirModalRegistrar() {
    this.formVenta = { cliente_id: '', productos: [] };
    this.agregarProducto();
  }

  agregarProducto() {
    this.formVenta.productos.push({ producto_id: '', cantidad: 1, precio: 0, subtotal: 0 });
  }

  eliminarProducto(index: number) {
    this.formVenta.productos.splice(index, 1);
  }

  onProductoChange(index: number) {
    const item = this.formVenta.productos[index];
    const prod = this.productos.find(p => p.id === Number(item.producto_id));
    item.precio = prod ? Number(prod.precio) : 0;
    item.subtotal = item.precio * Number(item.cantidad);
  }

  onCantidadChange(index: number) {
    const item = this.formVenta.productos[index];
    item.subtotal = Number(item.precio) * Number(item.cantidad);
  }

  calcularTotal(): number {
    return this.formVenta.productos.reduce((sum: number, item: any) => sum + Number(item.subtotal || 0), 0);
  }

  registrarVenta() {
    if (!this.formVenta.cliente_id) {
      Swal.fire('Error', 'Seleccione un cliente', 'error');
      return;
    }
    if (this.formVenta.productos.length === 0) {
      Swal.fire('Error', 'Agregue al menos un producto', 'error');
      return;
    }
    for (const item of this.formVenta.productos) {
      if (!item.producto_id || Number(item.cantidad) < 1) {
        Swal.fire('Error', 'Complete todos los productos con cantidad válida', 'error');
        return;
      }
    }

    this.cargando = true;
    const data = {
      cliente_id: Number(this.formVenta.cliente_id),
      productos: this.formVenta.productos.map((item: any) => ({
        producto_id: Number(item.producto_id),
        cantidad: Number(item.cantidad)
      }))
    };

    this.ventaService.registrar(data).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Venta registrada', timer: 1500, showConfirmButton: false });
        this.cerrarModal('btnCerrarModalVenta');
        this.cargarVentas();
        this.cargarProductos();
        this.cargando = false;
      },
      error: (err) => {
        Swal.fire('Error', err.error?.mensaje || 'Error al registrar venta', 'error');
        this.cargando = false;
      }
    });
  }

  verDetalle(venta: any) {
    this.ventaSeleccionada = venta;
    this.ventaService.obtener(venta.id).subscribe({
      next: (res: any) => { this.detalleVenta = res; },
      error: () => Swal.fire('Error', 'No se pudo cargar el detalle', 'error')
    });
  }

  anularVenta(venta: any) {
    if (venta.estado === 'ANULADA') {
      Swal.fire('Información', 'Esta venta ya está anulada', 'info');
      return;
    }
    Swal.fire({
      title: '¿Anular venta?',
      text: `Se anulará la venta #${venta.id} y se restaurará el stock`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545'
    }).then(r => {
      if (r.isConfirmed) {
        this.ventaService.anular(venta.id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Venta anulada', text: 'Stock restaurado', timer: 1500, showConfirmButton: false });
            this.cargarVentas();
            this.cargarProductos();
          },
          error: (err) => Swal.fire('Error', err.error?.mensaje || 'Error al anular', 'error')
        });
      }
    });
  }

  calcularTotalDetalle(): number {
    return this.detalleVenta.reduce((sum: number, d: any) => sum + Number(d.subtotal || 0), 0);
  }

  formatMoney(value: any): string {
    return Number(value || 0).toFixed(2);
  }

  cerrarModal(id: string) {
    document.getElementById(id)?.click();
  }
}
