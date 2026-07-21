import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  correo = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
  this.authService.login({
    correo: this.correo,
    password: this.password
  }).subscribe({
    next: (res: any) => {
      console.log('Login exitoso:', res);

      this.authService.saveToken(res.token);

      const user: any = jwtDecode(res.token);
      if (user.rol_id === 3 || user.rol_id === 4) {
        this.router.navigate(['/inicio']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    },
    error: (err) => {
      console.error(err);
    }
  });
 }
}