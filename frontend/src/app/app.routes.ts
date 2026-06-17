import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { ProductosComponent } from './features/productos/productos.component';
import { VentasComponent } from './features/ventas/ventas.component';
import { ReportesComponent } from './features/reportes/reportes.component';
import { PerfilComponent } from './features/perfil/perfil.component';

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
        component: ProductosComponent,
        canActivate: [roleGuard],
        data: { roles: [1] }
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
        component: ReportesComponent,
        canActivate: [roleGuard],
        data: { roles: [1] }
      },

      // Perfil
      {
        path: 'perfil',
        component: PerfilComponent
      }

    ]
  },

  {
    path: '**',
    redirectTo: ''
  }

];