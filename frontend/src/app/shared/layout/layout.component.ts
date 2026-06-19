import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {

  tituloPagina = 'DASHBOARD';
  sidebarOpen = false;
  private routeSubscription?: Subscription;

  private routeTitles: Record<string, string> = {
    '/dashboard': 'DASHBOARD',
    '/usuarios': 'USUARIOS',
    '/productos': 'PRODUCTOS',
    '/ventas': 'CONTROL DE VENTAS',
    '/reportes': 'REPORTES',
    '/perfil': 'PERFIL'
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.routeSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEnd = event as NavigationEnd;
        this.tituloPagina = this.routeTitles[navEnd.urlAfterRedirects] || 'SICOIN';
        this.closeSidebar();
      });
  }

  ngOnDestroy() {
    this.routeSubscription?.unsubscribe();
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