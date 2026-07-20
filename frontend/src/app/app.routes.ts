import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login.component';
import { RegistroClienteComponent } from './features/auth/registro-cliente/registro-cliente.component';
import { CatalogoComponent } from './features/catalogo/catalogo.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { ProductosComponent } from './features/productos/productos.component';
import { CategoriasComponent } from './features/categorias/categorias.component';
import { InventarioComponent } from './features/inventario/inventario.component';
import { VentasComponent } from './features/ventas/ventas.component';
import { ReportesComponent } from './features/reportes/reportes.component';
import { PerfilComponent } from './features/perfil/perfil.component';
import { AutorizacionComponent } from './features/autorizacion/autorizacion.component';
import { InicioComponent } from './features/inicio/inicio.component';
import { PagoComponent } from './features/pago/pago.component';
import { HistorialComprasComponent } from './features/historial-compras/historial-compras.component';

import { LayoutComponent } from './shared/layout/layout.component';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [

  // Login
  {
    path: '',
    component: LoginComponent
  },

  // Registro de cliente (público)
  {
    path: 'registro',
    component: RegistroClienteComponent
  },

  // Área protegida
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [

      {
        path: 'dashboard',
        component: DashboardComponent
      },

      // Usuarios (Admin)
      {
        path: 'usuarios',
        component: UsuariosComponent,
        canActivate: [roleGuard],
        data: { roles: [1] }
      },

      // Productos - Gestión (Admin)
      {
        path: 'productos',
        canActivate: [roleGuard],
        data: { roles: [1] },
        children: [
          { path: '', component: ProductosComponent },
          { path: 'categorias', component: CategoriasComponent },
          { path: 'inventario', component: InventarioComponent }
        ]
      },

      // Control de Ventas (Admin)
      {
        path: 'ventas',
        component: VentasComponent,
        canActivate: [roleGuard],
        data: { roles: [1] }
      },

      // Reportes (Admin)
      {
        path: 'reportes',
        canActivate: [roleGuard],
        data: { roles: [1] },
        children: [
          { path: '', redirectTo: 'inventario', pathMatch: 'full' },
          { path: 'inventario', component: ReportesComponent },
          { path: 'ventas', component: ReportesComponent },
          { path: 'clientes', component: ReportesComponent },
          { path: 'mas-vendidos', component: ReportesComponent },
          { path: 'movimientos', component: ReportesComponent }
        ]
      },

      // Perfil
      {
        path: 'perfil',
        component: PerfilComponent
      },

      // Catálogo (Cliente)
      {
        path: 'catalogo',
        component: CatalogoComponent,
        canActivate: [roleGuard],
        data: { roles: [3] }
      },

      // Inicio (Cliente)
      {
        path: 'inicio',
        component: InicioComponent,
        canActivate: [roleGuard],
        data: { roles: [3] }
      },

      // Pago (Cliente)
      {
        path: 'pago',
        component: PagoComponent,
        canActivate: [roleGuard],
        data: { roles: [3] }
      },

      // Mis Compras (Cliente)
      {
        path: 'mis-compras',
        component: HistorialComprasComponent,
        canActivate: [roleGuard],
        data: { roles: [3] }
      },

      // Bodeguero
      {
        path: 'inventario',
        component: InventarioComponent,
        canActivate: [roleGuard],
        data: { roles: [2] }
      },
      {
        path: 'autorizaciones',
        component: AutorizacionComponent,
        canActivate: [roleGuard],
        data: { roles: [2] }
      }

    ]
  },

  {
    path: '**',
    redirectTo: ''
  }

];