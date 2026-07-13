import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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

      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      console.error(err);
    }
  });
 }
}