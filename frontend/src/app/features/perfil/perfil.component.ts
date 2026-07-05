import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  editando = false;
  apiUrl = environment.apiUrl;
  usuario: any = {};
  form: any = { nombre: '', apellido: '', correo: '', password: '' };
  fotoPreview = '';
  archivoSeleccionado: File | null = null;
  cargando = true;
  rolId: number | null = null;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    const tokenData: any = this.authService.getUser();
    this.rolId = tokenData?.rol_id ?? null;
    if (tokenData?.id) {
      this.usuarioService.obtener(tokenData.id).subscribe({
        next: (res: any) => {
          this.usuario = res;
          this.form = {
            nombre: res.nombre || '',
            apellido: res.apellido || '',
            correo: res.correo || '',
            password: ''
          };
          this.fotoPreview = res.imagen ? `${this.apiUrl.replace('/api', '')}${res.imagen}` : '';
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
        }
      });
    } else {
      this.cargando = false;
    }
  }

  editar() {
    this.editando = true;
  }

  cancelar() {
    this.editando = false;
    this.archivoSeleccionado = null;
    this.fotoPreview = this.usuario.imagen ? `${this.apiUrl.replace('/api', '')}${this.usuario.imagen}` : '';
    this.form = {
      nombre: this.usuario.nombre || '',
      apellido: this.usuario.apellido || '',
      correo: this.usuario.correo || '',
      password: ''
    };
  }

  seleccionarFoto(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fotoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  guardar() {
    const formData = new FormData();
    formData.append('nombre', this.form.nombre);
    formData.append('apellido', this.form.apellido);
    formData.append('correo', this.form.correo);
    formData.append('rol_id', String(this.usuario.rol_id));
    formData.append('estado', String(this.usuario.estado));
    if (this.form.password) {
      formData.append('password', this.form.password);
    }
    if (this.archivoSeleccionado) {
      formData.append('imagen', this.archivoSeleccionado);
    } else if (this.usuario.imagen) {
      formData.append('imagen', this.usuario.imagen);
    }

    this.usuarioService.actualizar(this.usuario.id, formData).subscribe({
      next: (res: any) => {
        this.usuario = res.usuario;
        this.editando = false;
        this.archivoSeleccionado = null;
        this.form.password = '';
        this.fotoPreview = res.usuario.imagen ? `${this.apiUrl.replace('/api', '')}${res.usuario.imagen}` : '';
      },
      error: (err) => {
        console.error('Error al guardar perfil', err);
      }
    });
  }
}