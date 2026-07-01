import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AutorizacionService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get(`${this.apiUrl}/autorizaciones`);
  }

  crear(data: any) {
    return this.http.post(`${this.apiUrl}/autorizaciones`, data);
  }

  actualizarEstado(id: number, estado: string) {
    return this.http.put(`${this.apiUrl}/autorizaciones/${id}`, { estado });
  }

  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/autorizaciones/${id}`);
  }
}
