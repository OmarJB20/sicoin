import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get(`${this.apiUrl}/categorias`);
  }

  obtener(id: number) {
    return this.http.get(`${this.apiUrl}/categorias/${id}`);
  }

  crear(data: any) {
    return this.http.post(`${this.apiUrl}/categorias`, data);
  }

  actualizar(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/categorias/${id}`, data);
  }

  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/categorias/${id}`);
  }
}
