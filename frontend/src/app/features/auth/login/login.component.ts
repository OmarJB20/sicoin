import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
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