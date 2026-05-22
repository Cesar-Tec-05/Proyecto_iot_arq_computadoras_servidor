import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  protected readonly username = signal('');
  protected readonly password = signal('');
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly info = signal('');

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    if (this.auth.isAuthenticated()) {
      void this.router.navigate(['/dashboard']);
      return;
    }

    const registered = this.route.snapshot.queryParamMap.get('registered');
    if (registered === '1') {
      this.info.set('Registro exitoso. Ya puedes logearte.');
    }
  }

  onUsernameChange(value: string) {
    this.username.set(value);
  }

  onPasswordChange(value: string) {
    this.password.set(value);
  }

  async login() {
    this.busy.set(true);
    this.error.set('');

    try {
      await this.auth.login(this.username(), this.password());
      await this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.error.set(e?.error?.message ?? e?.message ?? 'No se pudo iniciar sesión');
    } finally {
      this.busy.set(false);
    }
  }
}
