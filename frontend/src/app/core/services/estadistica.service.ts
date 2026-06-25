import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EstadisticaService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  obtenerEstadisticas() {
    return this.http.get(`${this.apiUrl}/estadisticas`);
  }

  obtenerAlertas() {
    return this.http.get(`${this.apiUrl}/estadisticas/alertas`);
  }

  obtenerModa() {
    return this.http.get(`${this.apiUrl}/estadisticas/moda`);
  }

  marcarLeida(id: number) {
    return this.http.put(`${this.apiUrl}/estadisticas/alertas/${id}/leer`, {});
  }
}
