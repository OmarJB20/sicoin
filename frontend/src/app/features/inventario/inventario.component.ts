import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../core/services/producto.service';
import { MovimientoService } from '../../core/services/movimiento.service';
import { AuthService } from '../../core/services/auth.service';
import { EstadisticaService } from '../../core/services/estadistica.service';
import { AutorizacionService } from '../../core/services/autorizacion.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
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
  showSolicitudModal = false;
  formSolicitud: any = { producto_id: '', cantidad: '', observacion: '' };
  rolId: number | null = null;
  cargandoPDF = false;

  constructor(
    private productoService: ProductoService,
    private movimientoService: MovimientoService,
    private authService: AuthService,
    private estadisticaService: EstadisticaService,
    private autorizacionService: AutorizacionService
  ) {}

  ngOnInit() {
    const user: any = this.authService.getUser();
    this.rolId = user?.rol_id ?? null;

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

  abrirModalSolicitud() {
    this.formSolicitud = { producto_id: '', cantidad: '', observacion: '' };
    this.showSolicitudModal = true;
  }

  cerrarModalSolicitud() {
    this.showSolicitudModal = false;
  }

  crearSolicitud() {
    if (!this.formSolicitud.producto_id || !this.formSolicitud.cantidad) {
      Swal.fire('Validación', 'Selecciona un producto y una cantidad', 'warning');
      return;
    }

    this.autorizacionService.crear(this.formSolicitud).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Solicitud creada', text: 'El bodeguero debe autorizarla', timer: 1500, showConfirmButton: false });
        this.cerrarModalSolicitud();
      },
      error: () => Swal.fire('Error', 'No se pudo crear la solicitud', 'error')
    });
  }

  generarPDF() {
    const elemento = document.getElementById('reporte-contenido');
    if (!elemento) return;

    this.cargandoPDF = true;

    const header = elemento.querySelector('.report-header') as HTMLElement;
    if (header) header.style.display = 'block';

    setTimeout(() => {
      html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        logging: false
      }).then((canvas) => {
        if (header) header.style.display = 'none';

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        let heightLeft = pdfHeight;
        let position = 0;
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }

        pdf.save('reporte-movimientos.pdf');
        this.cargandoPDF = false;
      }).catch(() => {
        if (header) header.style.display = 'none';
        this.cargandoPDF = false;
      });
    }, 50);
  }

  imprimir() {
    window.print();
  }
}
