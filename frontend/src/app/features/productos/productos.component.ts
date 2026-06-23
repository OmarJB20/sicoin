import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../core/services/producto.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { MovimientoService } from '../../core/services/movimiento.service';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {

  tabActivo: string = 'productos';

  productos: any[] = [];
  categorias: any[] = [];
  movimientos: any[] = [];

  busqueda = '';

  get productosFiltrados() {
    if (!this.busqueda.trim()) return this.productos;
    const t = this.busqueda.toLowerCase().trim();
    return this.productos.filter(p =>
      p.nombre?.toLowerCase().includes(t) ||
      p.categoria?.toLowerCase().includes(t)
    );
  }

  editandoProducto = false;
  editandoCategoria = false;
  productoId: number | null = null;
  categoriaId: number | null = null;

  formProducto: any = { nombre: '', descripcion: '', precio: '', stock: '', stock_minimo: '', categoria_id: '', imagen: '' };
  formCategoria: any = { nombre: '', descripcion: '' };
  formMovimiento: any = { producto_id: '', tipo_movimiento: 'ENTRADA', cantidad: '', observacion: '' };
  tipoMovimientoActual: string = 'ENTRADA';

  cargando = false;

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private movimientoService: MovimientoService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarProductos();
    this.cargarCategorias();
    if (this.tabActivo === 'inventario') {
      this.cargarMovimientos();
    }
  }

  cambiarTab(tab: string) {
    this.tabActivo = tab;
    if (tab === 'inventario') {
      this.cargarProductos();
      this.cargarMovimientos();
    }
  }

  // ─── PRODUCTOS ───

  cargarProductos() {
    this.productoService.listar().subscribe({
      next: (res: any) => { this.productos = res; },
      error: () => Swal.fire('Error', 'No se pudieron cargar los productos', 'error')
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
        stock_minimo: prod.stock_minimo,
        categoria_id: prod.categoria_id,
        imagen: prod.imagen || '',
        estado: prod.estado
      };
    } else {
      this.editandoProducto = false;
      this.productoId = null;
      this.formProducto = { nombre: '', descripcion: '', precio: '', stock: '', stock_minimo: '', categoria_id: '', imagen: '' };
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
      stock_minimo: Number(this.formProducto.stock_minimo) || 0,
      categoria_id: Number(this.formProducto.categoria_id),
      imagen: this.formProducto.imagen?.trim() || '',
      estado: this.formProducto.estado ?? 1
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

  // ─── CATEGORÍAS ───

  cargarCategorias() {
    this.categoriaService.listar().subscribe({
      next: (res: any) => { this.categorias = res; },
      error: () => Swal.fire('Error', 'No se pudieron cargar las categorías', 'error')
    });
  }

  abrirModalCategoria(cat?: any) {
    if (cat) {
      this.editandoCategoria = true;
      this.categoriaId = cat.id;
      this.formCategoria = { nombre: cat.nombre, descripcion: cat.descripcion || '' };
    } else {
      this.editandoCategoria = false;
      this.categoriaId = null;
      this.formCategoria = { nombre: '', descripcion: '' };
    }
  }

  guardarCategoria() {
    if (!this.formCategoria.nombre?.trim()) {
      Swal.fire('Error', 'El nombre es obligatorio', 'error');
      return;
    }
    const data = { nombre: this.formCategoria.nombre.trim(), descripcion: this.formCategoria.descripcion?.trim() || '' };

    const req = this.editandoCategoria
      ? this.categoriaService.actualizar(this.categoriaId!, data)
      : this.categoriaService.crear(data);

    req.subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Éxito', text: this.editandoCategoria ? 'Categoría actualizada' : 'Categoría creada', timer: 1500, showConfirmButton: false });
        this.cerrarModal('btnCerrarModalCategoria');
        this.cargarCategorias();
      },
      error: (err) => Swal.fire('Error', err.error?.mensaje || 'Error al guardar', 'error')
    });
  }

  confirmarEliminarCategoria(c: any) {
    Swal.fire({
      title: '¿Eliminar categoría?',
      text: `Se eliminará ${c.nombre}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545'
    }).then(r => {
      if (r.isConfirmed) {
        this.categoriaService.eliminar(c.id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Categoría eliminada', timer: 1500, showConfirmButton: false });
            this.cargarCategorias();
          },
          error: (err) => Swal.fire('Error', err.error?.mensaje || 'Error al eliminar', 'error')
        });
      }
    });
  }

  // ─── INVENTARIO ───

  cargarMovimientos() {
    this.movimientoService.listar().subscribe({
      next: (res: any) => { this.movimientos = res; },
      error: () => Swal.fire('Error', 'No se pudieron cargar los movimientos', 'error')
    });
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

  // ─── UTILIDADES ───

  getNombreCategoria(id: number): string {
    const c = this.categorias.find(c => c.id === id);
    return c ? c.nombre : 'Sin categoría';
  }

  stockBajo(p: any): boolean {
    return p.stock <= p.stock_minimo;
  }

  cerrarModal(id: string) {
    document.getElementById(id)?.click();
  }
}
