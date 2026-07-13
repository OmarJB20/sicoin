import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { EstadisticaService } from '../../core/services/estadistica.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {

  tituloPagina = 'DASHBOARD';
  sidebarOpen = false;
  subNavOpen = false;
  subNavReportesOpen = false;
  alertas: any[] = [];
  showNotificaciones = false;
  rolId: number | null = null;
  private routeSubscription?: Subscription;
  private alertaSubscription?: Subscription;

  private routeTitles: Record<string, string> = {
    '/dashboard': 'DASHBOARD',
    '/usuarios': 'USUARIOS',
    '/productos': 'PRODUCTOS',
    '/productos/categorias': 'CATEGORÍAS',
    '/productos/inventario': 'INVENTARIO',
    '/ventas': 'CONTROL DE VENTAS',
    '/reportes/inventario': 'REPORTE - INVENTARIO',
    '/reportes/ventas': 'REPORTE - VENTAS',
    '/reportes/clientes': 'REPORTE - CLIENTES',
    '/reportes/mas-vendidos': 'REPORTE - MÁS VENDIDOS',
    '/reportes/movimientos': 'REPORTE - MOVIMIENTOS',
    '/perfil': 'PERFIL',
    '/inventario': 'CONTROL DE INVENTARIO',
    '/autorizaciones': 'AUTORIZACIÓN DE REGISTROS',
    '/catalogo': 'CATÁLOGO'
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private estadisticaService: EstadisticaService
  ) {}

  ngOnInit() {
    const user: any = this.authService.getUser();
    this.rolId = user?.rol_id ?? null;

    this.subNavOpen = this.router.url.startsWith('/productos');
    this.subNavReportesOpen = this.router.url.startsWith('/reportes');

    this.routeSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEnd = event as NavigationEnd;
        const url = navEnd.urlAfterRedirects;
        this.tituloPagina = this.routeTitles[url] || 'SICOIN';
        this.subNavOpen = url.startsWith('/productos');
        this.subNavReportesOpen = url.startsWith('/reportes');
        this.closeSidebar();
      });

    this.cargarAlertas();
  }

  ngOnDestroy() {
    this.routeSubscription?.unsubscribe();
    this.alertaSubscription?.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notif-container')) {
      this.showNotificaciones = false;
    }
  }

  cargarAlertas() {
    this.alertaSubscription = this.estadisticaService.obtenerAlertas().subscribe({
      next: (data: any) => { this.alertas = data; },
      error: () => {}
    });
  }

  toggleNotificaciones() {
    this.showNotificaciones = !this.showNotificaciones;
    if (this.showNotificaciones) {
      this.cargarAlertas();
    }
  }

  marcarLeida(id: number) {
    this.estadisticaService.marcarLeida(id).subscribe({
      next: () => {
        this.alertas = this.alertas.filter(a => a.id !== id);
      },
      error: () => {}
    });
  }

  toggleSubNav(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.subNavOpen = !this.subNavOpen;
  }

  toggleSubNavReportes(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.subNavReportesOpen = !this.subNavReportesOpen;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

}