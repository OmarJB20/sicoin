import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../core/services/producto.service';
import { VentaService } from '../../core/services/venta.service';
import { ClienteService } from '../../core/services/cliente.service';
import { MovimientoService } from '../../core/services/movimiento.service';
import { ReporteService } from '../../core/services/reporte.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {

  logoEmpresa = 'data:image/png;base64,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';

  reporteActivo: string = 'inventario';

  inventario: any[] = [];
  ventas: any[] = [];
  clientes: any[] = [];
  masVendidos: any[] = [];
  movimientos: any[] = [];

  fechaDesde = '';
  fechaHasta = '';

  cargando = false;

  constructor(
    private productoService: ProductoService,
    private ventaService: VentaService,
    private clienteService: ClienteService,
    private movimientoService: MovimientoService,
    private reporteService: ReporteService
  ) {}

  ngOnInit() {
    this.cargarInventario();
    this.cargarVentas();
    this.cargarClientes();
    this.cargarMovimientos();
    this.cargarMasVendidos();
  }

  cambiarReporte(tipo: string) {
    this.reporteActivo = tipo;
  }

  cargarInventario() {
    this.productoService.listar().subscribe({
      next: (res: any) => { this.inventario = res; },
      error: () => {}
    });
  }

  cargarVentas() {
    this.ventaService.listar().subscribe({
      next: (res: any) => { this.ventas = res; },
      error: () => {}
    });
  }

  cargarClientes() {
    this.clienteService.listar().subscribe({
      next: (res: any) => { this.clientes = res; },
      error: () => {}
    });
  }

  cargarMovimientos() {
    this.movimientoService.listar().subscribe({
      next: (res: any) => { this.movimientos = res; },
      error: () => {}
    });
  }

  cargarMasVendidos() {
    this.reporteService.masVendidos(this.fechaDesde || undefined, this.fechaHasta || undefined).subscribe({
      next: (res: any) => { this.masVendidos = res; },
      error: () => {}
    });
  }

  consultarMasVendidos() {
    this.cargarMasVendidos();
  }

  get tituloReporte(): string {
    const map: Record<string, string> = {
      inventario: 'Inventario de Productos',
      ventas: 'Registro de Ventas',
      clientes: 'Directorio de Clientes',
      'mas-vendidos': 'Productos Más Vendidos',
      movimientos: 'Movimientos de Inventario'
    };
    return map[this.reporteActivo] || 'Reporte';
  }

  get fechaGeneracion(): string {
    const now = new Date();
    const dia = String(now.getDate()).padStart(2, '0');
    const mes = String(now.getMonth() + 1).padStart(2, '0');
    const anio = now.getFullYear();
    const hora = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${anio} ${hora}:${min}`;
  }

  formatMoney(value: any): string {
    return Number(value || 0).toFixed(2);
  }

  generarPDF() {
    const elemento = document.getElementById('reporte-contenido');
    if (!elemento) return;

    this.cargando = true;

    const header = document.querySelector('.report-header') as HTMLElement;
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

        pdf.save(`reporte-${this.reporteActivo}.pdf`);
        this.cargando = false;
      }).catch(() => {
        if (header) header.style.display = 'none';
        this.cargando = false;
      });
    }, 50);
  }

  imprimir() {
    window.print();
  }

  onProductoChange(index: number) {
  }
}
