import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {
  protected readonly username = signal('');
  protected readonly password = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly busy = signal(false);
  protected readonly error = signal('');

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  onUsernameChange(value: string) {
    this.username.set(value);
  }

  onPasswordChange(value: string) {
    this.password.set(value);
  }

  onConfirmPasswordChange(value: string) {
    this.confirmPassword.set(value);
  }

  async register() {
    this.error.set('');
    if (this.password() !== this.confirmPassword()) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.busy.set(true);
    try {
      await this.auth.register(this.username(), this.password());
      await this.router.navigate(['/login'], { queryParams: { registered: '1' } });
    } catch (e: any) {
      this.error.set(e?.error?.message ?? e?.message ?? 'No se pudo registrar el usuario');
    } finally {
      this.busy.set(false);
    }
  }
}
