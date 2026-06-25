import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../core/services/categoria.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.css'
})
export class CategoriasComponent implements OnInit {

  categorias: any[] = [];
  editandoCategoria = false;
  categoriaId: number | null = null;
  formCategoria: any = { nombre: '', descripcion: '' };

  constructor(private categoriaService: CategoriaService) {}

  ngOnInit() {
    this.cargarCategorias();
  }

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

  cerrarModal(id: string) {
    document.getElementById(id)?.click();
  }
}
