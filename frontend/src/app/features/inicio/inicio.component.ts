import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductoService } from '../../core/services/producto.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {
  productosDestacados: any[] = [];

  constructor(private productoService: ProductoService) {}

  ngOnInit() {
    this.productoService.listar().subscribe({
      next: (res: any) => {
        this.productosDestacados = res.slice(0, 6);
      },
      error: () => {}
    });
  }
}
