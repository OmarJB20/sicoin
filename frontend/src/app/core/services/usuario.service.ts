import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get(`${this.apiUrl}/usuarios`);
  }

  obtener(id: number) {
    return this.http.get(`${this.apiUrl}/usuarios/${id}`);
  }

  registrar(data: any) {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  actualizar(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/usuarios/${id}`, data);
  }

  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/usuarios/${id}`);
  }
}
