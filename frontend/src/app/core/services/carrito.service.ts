import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CarritoItem {
  producto_id: number;
  nombre: string;
  precio: number;
  imagen: string | null;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  private readonly STORAGE_KEY = 'carrito';
  private items$ = new BehaviorSubject<CarritoItem[]>(this.cargarStorage());

  items = this.items$.asObservable();

  private cargarStorage(): CarritoItem[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private guardar(items: CarritoItem[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this.items$.next(items);
  }

  agregar(producto: { id: number; nombre: string; precio: number; imagen: string | null }) {
    const items = this.cargarStorage();
    const existente = items.find(i => i.producto_id === producto.id);

    if (existente) {
      existente.cantidad += 1;
    } else {
      items.push({
        producto_id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagen,
        cantidad: 1
      });
    }

    this.guardar(items);
  }

  eliminar(productoId: number) {
    const items = this.cargarStorage().filter(i => i.producto_id !== productoId);
    this.guardar(items);
  }

  actualizarCantidad(productoId: number, cantidad: number) {
    const items = this.cargarStorage();
    const item = items.find(i => i.producto_id === productoId);

    if (item) {
      if (cantidad <= 0) {
        this.eliminar(productoId);
      } else {
        item.cantidad = cantidad;
        this.guardar(items);
      }
    }
  }

  obtenerItems(): CarritoItem[] {
    return this.cargarStorage();
  }

  obtenerCantidad(): number {
    return this.cargarStorage().reduce((sum, i) => sum + i.cantidad, 0);
  }

  obtenerTotal(): number {
    return this.cargarStorage().reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
  }

  limpiar() {
    this.guardar([]);
  }
}
