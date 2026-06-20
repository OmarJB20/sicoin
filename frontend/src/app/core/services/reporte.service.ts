import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  masVendidos(desde?: string, hasta?: string) {
    let params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    return this.http.get(`${this.apiUrl}/reportes/productos-mas-vendidos`, { params });
  }
}
