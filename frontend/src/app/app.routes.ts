import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { ProductosComponent } from './features/productos/productos.component';
import { CategoriasComponent } from './features/categorias/categorias.component';
import { InventarioComponent } from './features/inventario/inventario.component';
import { VentasComponent } from './features/ventas/ventas.component';
import { ReportesComponent } from './features/reportes/reportes.component';
import { PerfilComponent } from './features/perfil/perfil.component';
import { AutorizacionComponent } from './features/autorizacion/autorizacion.component';

import { LayoutComponent } from './shared/layout/layout.component';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [

  // Login
  {
    path: '',
    component: LoginComponent
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