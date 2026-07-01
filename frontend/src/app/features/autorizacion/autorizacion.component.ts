import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutorizacionService } from '../../core/services/autorizacion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-autorizacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './autorizacion.component.html',
  styleUrl: './autorizacion.component.css'
})
export class AutorizacionComponent implements OnInit {

  autorizaciones: any[] = [];

  constructor(private autorizacionService: AutorizacionService) {}

  ngOnInit() {
    this.cargarAutorizaciones();
  }

  cargarAutorizaciones() {
    this.autorizacionService.listar().subscribe({
      next: (res: any) => { this.autorizaciones = res; },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar las autorizaciones', 'error');
      }
    });
  }

  cambiarEstado(autorizacion: any, nuevoEstado: string) {
    this.autorizacionService.actualizarEstado(autorizacion.id, nuevoEstado).subscribe({
      next: () => {
        Swal.fire('Actualizado', `Estado cambiado a ${nuevoEstado}`, 'success');
        this.cargarAutorizaciones();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
      }
    });
  }

  eliminar(id: number) {
    Swal.fire({
      title: '¿Eliminar autorización?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.autorizacionService.eliminar(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Autorización eliminada', 'success');
            this.cargarAutorizaciones();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar', 'error');
          }
        });
      }
    });
  }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'badge bg-warning text-dark';
      case 'AUTORIZADO': return 'badge bg-success';
      case 'CANCELADO': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }
}
