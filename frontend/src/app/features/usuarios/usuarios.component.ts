import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { RolService } from '../../core/services/rol.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {

  usuarios: any[] = [];
  roles: any[] = [];
  editando = false;
  busqueda = '';

  get usuariosFiltrados() {
    if (!this.busqueda.trim()) return this.usuarios;
    const t = this.busqueda.toLowerCase().trim();
    return this.usuarios.filter(u =>
      u.nombre?.toLowerCase().includes(t) ||
      u.apellido?.toLowerCase().includes(t) ||
      u.correo?.toLowerCase().includes(t)
    );
  }
  formData: any = { nombre: '', apellido: '', correo: '', password: '', rol_id: 1 };
  usuarioId: number | null = null;
  cargando = false;

  constructor(
    private usuarioService: UsuarioService,
    private rolService: RolService
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  cargarUsuarios() {
    this.cargando = true;
    this.usuarioService.listar().subscribe({
      next: (res: any) => {
        this.usuarios = res;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
      }
    });
  }

  cargarRoles() {
    this.rolService.listar().subscribe({
      next: (res: any) => {
        this.roles = res;
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los roles', 'error');
      }
    });
  }

  abrirModalCrear() {
    this.editando = false;
    this.usuarioId = null;
    this.formData = { nombre: '', apellido: '', correo: '', password: '', rol_id: 1 };
  }

  abrirModalEditar(u: any) {
    this.editando = true;
    this.usuarioId = u.id;
    this.formData = {
      nombre: u.nombre,
      apellido: u.apellido,
      correo: u.correo,
      password: '',
      rol_id: u.rol_id
    };
  }

  guardar() {
    if (!this.formData.nombre?.trim() || !this.formData.apellido?.trim() || !this.formData.correo?.trim()) {
      Swal.fire('Error', 'Todos los campos obligatorios deben estar llenos', 'error');
      return;
    }
    if (!this.editando && !this.formData.password?.trim()) {
      Swal.fire('Error', 'La contraseña es obligatoria para nuevos usuarios', 'error');
      return;
    }

    const data: any = {
      nombre: this.formData.nombre.trim(),
      apellido: this.formData.apellido.trim(),
      correo: this.formData.correo.trim(),
      rol_id: Number(this.formData.rol_id),
      estado: true
    };

    if (this.formData.password?.trim()) {
      data.password = this.formData.password.trim();
    }

    if (this.editando) {
      this.usuarioService.actualizar(this.usuarioId!, data).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Éxito', text: 'Usuario actualizado correctamente', timer: 1500, showConfirmButton: false });
          this.cerrarModal();
          this.cargarUsuarios();
        },
        error: (err) => Swal.fire('Error', err.error?.mensaje || 'Error al actualizar', 'error')
      });
    } else {
      this.usuarioService.registrar(data).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Éxito', text: 'Usuario creado correctamente', timer: 1500, showConfirmButton: false });
          this.cerrarModal();
          this.cargarUsuarios();
        },
        error: (err) => Swal.fire('Error', err.error?.mensaje || 'Error al crear', 'error')
      });
    }
  }

  toggleEstado(u: any) {
    const nuevoEstado = !u.estado;
    const accion = nuevoEstado ? 'Activar' : 'Desactivar';

    Swal.fire({
      title: `¿${accion} usuario?`,
      text: `Se va a ${accion.toLowerCase()} el usuario ${u.nombre} ${u.apellido}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.actualizar(u.id, {
          nombre: u.nombre,
          apellido: u.apellido,
          correo: u.correo,
          rol_id: u.rol_id,
          estado: nuevoEstado
        }).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Éxito', text: `Usuario ${accion.toLowerCase()}do`, timer: 1500, showConfirmButton: false });
            this.cargarUsuarios();
          },
          error: (err) => Swal.fire('Error', err.error?.mensaje || 'Error al actualizar', 'error')
        });
      }
    });
  }

  confirmarEliminar(u: any) {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: `Se eliminará permanentemente ${u.nombre} ${u.apellido}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.eliminar(u.id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Usuario eliminado correctamente', timer: 1500, showConfirmButton: false });
            this.cargarUsuarios();
          },
          error: (err) => Swal.fire('Error', err.error?.mensaje || 'Error al eliminar', 'error')
        });
      }
    });
  }

  getNombreRol(rolId: number): string {
    const rol = this.roles.find(r => r.id === rolId);
    return rol ? rol.nombre : 'Desconocido';
  }

  cerrarModal() {
    document.getElementById('btnCerrarModal')?.click();
  }
}
