import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../core/services/producto.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { CarritoService } from '../../core/services/carrito.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css'
})
export class CatalogoComponent implements OnInit {
  productos: any[] = [];
  productosFiltrados: any[] = [];
  categorias: any[] = [];

  textoBusqueda = '';
  categoriaSeleccionada: number | null = null;

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private carritoService: CarritoService
  ) {}

  ngOnInit() {
    this.productoService.listar().subscribe({
      next: (res: any) => {
        this.productos = res;
        this.filtrarProductos();
      },
      error: () => {}
    });

    this.categoriaService.listar().subscribe({
      next: (res: any) => { this.categorias = res; },
      error: () => {}
    });
  }

  seleccionarCategoria(id: number | null) {
    this.categoriaSeleccionada = id;
    this.filtrarProductos();
  }

  filtrarProductos() {
    let resultado = [...this.productos];

    if (this.categoriaSeleccionada !== null) {
      resultado = resultado.filter(p => p.categoria_id === this.categoriaSeleccionada);
    }

    if (this.textoBusqueda.trim()) {
      const busqueda = this.textoBusqueda.toLowerCase().trim();
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(busqueda) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(busqueda))
      );
    }

    this.productosFiltrados = resultado;
  }

  contarProductosCategoria(id: number): number {
    return this.productos.filter(p => p.categoria_id === id).length;
  }

  agregarAlCarrito(producto: any) {
    this.carritoService.agregar({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen
    });
    Swal.fire({
      icon: 'success',
      title: 'Agregado al carrito',
      text: producto.nombre,
      timer: 1200,
      showConfirmButton: false,
      position: 'top-end',
      toast: true
    });
  }
}
