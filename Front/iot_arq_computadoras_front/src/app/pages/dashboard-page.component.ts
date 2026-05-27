import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EspApiService, EspLogEntry, LedState } from '../esp-api.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css'
})
export class DashboardPageComponent implements OnInit {
  private readonly api = inject(EspApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly ledState = signal<LedState>('off');
  protected readonly busy = signal(false);
  protected readonly loadingHistory = signal(false);
  protected readonly status = signal('Listo para Comunicarte con la Cerradura :D');
  protected readonly error = signal('');
  protected readonly history = signal<EspLogEntry[]>([]);

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    await this.refreshHistory();
  }

  logout() {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }

  async turnLed(state: LedState) {
    this.busy.set(true);
    this.error.set('');

    try {
      await firstValueFrom(this.api.toggleLed(state));
      this.ledState.set(state);
      this.status.set(`Cerradura ${state === 'on' ? 'abierta' : 'cerrada'}`);
      await this.refreshHistory();
    } catch (error) {
      this.error.set(this.describeError(error));
      this.status.set('No se pudo comunicar con el con la cerradura, comunicate con soporte');
    } finally {
      this.busy.set(false);
    }
  }

  async refreshHistory() {
    this.loadingHistory.set(true);
    this.error.set('');

    try {
      const records = await firstValueFrom(this.api.getLogs());
      this.history.set(records);

      if (records.length > 0) {
        this.ledState.set(records[0].action);
      }

      this.status.set('Historial actualizado');
    } catch (error) {
      this.error.set(this.describeError(error));
      this.status.set('No se pudo cargar el historial, comunicate con soporte');
    } finally {
      this.loadingHistory.set(false);
    }
  }

  formatTimestamp(value: string) {
    return new Date(value).toLocaleString();
  }

  private describeError(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Error desconocido al comunicar con la cerradura, comunicate con soporte';
  }
}
