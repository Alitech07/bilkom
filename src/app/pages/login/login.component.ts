import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  login     = '';
  password     = '';
  showPassword = false;
  isLoading    = false;
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.login || !this.password) return;
    this.isLoading    = true;
    this.errorMessage = '';

    this.auth.login(this.login, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading    = false;
        this.errorMessage = err.status === 401
          ? 'Login yoki parol noto\'g\'ri'
          : 'Server bilan bog\'lanishda xato. Qayta urinib ko\'ring.';
      },
    });
  }
}
