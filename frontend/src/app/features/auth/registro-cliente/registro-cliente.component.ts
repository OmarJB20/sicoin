import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro-cliente.component.html',
  styleUrl: './registro-cliente.component.css'
})
export class RegistroClienteComponent {
  nombre = '';
  apellido = '';
  correo = '';
  password = '';
  telefono = '';
  direccion = '';

  constructor(private http: HttpClient, private router: Router) {}

  registrar() {
    this.http.post(`${environment.apiUrl}/auth/registrar-cliente`, {
      nombre: this.nombre,
      apellido: this.apellido,
      correo: this.correo,
      password: this.password,
      telefono: this.telefono || undefined,
      direccion: this.direccion || undefined
    }).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: 'Ahora puedes iniciar sesión',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/']);
        });
      },
      error: (err) => {
        Swal.fire('Error', err.error?.mensaje || 'Error al registrarse', 'error');
      }
    });
  }
}
