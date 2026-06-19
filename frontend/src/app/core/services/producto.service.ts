import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get(`${this.apiUrl}/productos`);
  }

  obtener(id: number) {
    return this.http.get(`${this.apiUrl}/productos/${id}`);
  }

  crear(data: any) {
    return this.http.post(`${this.apiUrl}/productos`, data);
  }

  actualizar(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/productos/${id}`, data);
  }

  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/productos/${id}`);
  }
}
