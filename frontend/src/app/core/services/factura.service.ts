import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FacturaService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listarPendientes() {
    return this.http.get(`${this.apiUrl}/facturas`);
  }

  listarPorUsuario() {
    return this.http.get(`${this.apiUrl}/facturas/mis-facturas`);
  }

  obtener(id: number) {
    return this.http.get(`${this.apiUrl}/facturas/${id}`);
  }

  crear(data: any) {
    return this.http.post(`${this.apiUrl}/ventas/pendiente`, data);
  }

  procesarSalida(id: number) {
    return this.http.put(`${this.apiUrl}/facturas/${id}/procesar-salida`, {});
  }
}
