import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../core/services/producto.service';
import { CategoriaService } from '../../core/services/categoria.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {

  productos: any[] = [];
  categorias: any[] = [];
  busqueda = '';
  paginaActual = 1;
  productosPorPagina = 6;

  get productosFiltrados() {
    if (!this.busqueda.trim()) return this.productos;
    this.paginaActual = 1;
    const t = this.busqueda.toLowerCase().trim();
    return this.productos.filter(p =>
      p.nombre?.toLowerCase().includes(t) ||
      p.categoria?.toLowerCase().includes(t)
    );
  }

  get totalPaginas(): number {
    return Math.ceil(this.productosFiltrados.length / this.productosPorPagina) || 1;
  }

  get productosPaginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.productosPorPagina;
    return this.productosFiltrados.slice(inicio, inicio + this.productosPorPagina);
  }

  cambiarPagina(n: number) {
    if (n < 1 || n > this.totalPaginas) return;
    this.paginaActual = n;
  }

  editandoProducto = false;
  productoId: number | null = null;

  formProducto: any = { nombre: '', descripcion: '', precio: '', stock: '', categoria_id: '', imagen: '' };

  cargando = false;

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService
  ) {}

  ngOnInit() {
    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarProductos() {
    this.productoService.listar().subscribe({
      next: (res: any) => { this.productos = res; },
      error: () => Swal.fire('Error', 'No se pudieron cargar los productos', 'error')
    });
  }

  cargarCategorias() {
    this.categoriaService.listar().subscribe({
      next: (res: any) => { this.categorias = res; },
      error: () => Swal.fire('Error', 'No se pudieron cargar las categorías', 'error')
    });
  }

  abrirModalProducto(prod?: any) {
    if (prod) {
      this.editandoProducto = true;
      this.productoId = prod.id;
      this.formProducto = {
        nombre: prod.nombre,
        descripcion: prod.descripcion || '',
        precio: prod.precio,
        stock: prod.stock,
        categoria_id: prod.categoria_id,
        imagen: prod.imagen || '',
        estado: prod.estado,
        stock_minimo: prod.stock_minimo || 0
      };
    } else {
      this.editandoProducto = false;
      this.productoId = null;
      this.formProducto = { nombre: '', descripcion: '', precio: '', stock: '', categoria_id: '', imagen: '', stock_minimo: 0 };
    }
  }

  guardarProducto() {
    if (!this.formProducto.nombre?.trim() || !this.formProducto.precio || !this.formProducto.categoria_id) {
      Swal.fire('Error', 'Nombre, precio y categoría son obligatorios', 'error');
      return;
    }
    const data = {
      nombre: this.formProducto.nombre.trim(),
      descripcion: this.formProducto.descripcion?.trim() || '',
      precio: Number(this.formProducto.precio),
      stock: Number(this.formProducto.stock) || 0,
      categoria_id: Number(this.formProducto.categoria_id),
      imagen: this.formProducto.imagen?.trim() || '',
      estado: this.formProducto.estado ?? 1,
      stock_minimo: Number(this.formProducto.stock_minimo) || 0
    };

    const req = this.editandoProducto
      ? this.productoService.actualizar(this.productoId!, data)
      : this.productoService.crear(data);

    req.subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Éxito', text: this.editandoProducto ? 'Producto actualizado' : 'Producto creado', timer: 1500, showConfirmButton: false });
        this.cerrarModal('btnCerrarModalProducto');
        this.cargarProductos();
      },
      error: (err) => Swal.fire('Error', err.error?.mensaje || 'Error al guardar', 'error')
    });
  }

  confirmarEliminarProducto(p: any) {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: `Se eliminará ${p.nombre}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545'
    }).then(r => {
      if (r.isConfirmed) {
        this.productoService.eliminar(p.id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Producto eliminado', timer: 1500, showConfirmButton: false });
            this.cargarProductos();
          },
          error: (err) => Swal.fire('Error', err.error?.mensaje || 'Error al eliminar', 'error')
        });
      }
    });
  }

  getNombreCategoria(id: number): string {
    const c = this.categorias.find(c => c.id === id);
    return c ? c.nombre : 'Sin categoría';
  }

  stockBajo(p: any): boolean {
    return p.stock_minimo > 0 ? p.stock <= p.stock_minimo : false;
  }

  cerrarModal(id: string) {
    document.getElementById(id)?.click();
  }
}
