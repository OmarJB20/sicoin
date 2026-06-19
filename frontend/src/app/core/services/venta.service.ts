import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get(`${this.apiUrl}/ventas`);
  }

  obtener(id: number) {
    return this.http.get(`${this.apiUrl}/ventas/${id}`);
  }

  registrar(data: any) {
    return this.http.post(`${this.apiUrl}/ventas`, data);
  }

  anular(id: number) {
    return this.http.put(`${this.apiUrl}/ventas/${id}/anular`, {});
  }
}
