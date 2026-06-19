import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get(`${this.apiUrl}/roles`);
  }

  obtener(id: number) {
    return this.http.get(`${this.apiUrl}/roles/${id}`);
  }
}
