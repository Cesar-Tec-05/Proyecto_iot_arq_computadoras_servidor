import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export type LedState = 'on' | 'off';

export interface EspLogEntry {
  _id?: string;
  action: LedState;
  source: string;
  timestamp: string;
  _optimistic?: boolean;
}

@Injectable({ providedIn: 'root' })
export class EspApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  toggleLed(state: LedState) {
    return this.http.get('/api/esp/rele', {
      params: { state },
    });
  }

  getLogs() {
    return this.http.get<EspLogEntry[]>('/api/esp/logs');
  }

  // Escuchar logs en tiempo real usando Server-Sent Events (EventSource)
  listenLogs(): Observable<EspLogEntry> {
    return new Observable((observer) => {
      const token = this.auth.getToken();
      const url = token ? `/api/esp/logs/stream?token=${encodeURIComponent(token)}` : '/api/esp/logs/stream';
      const es = new EventSource(url);

      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data) as EspLogEntry;
          observer.next(data);
        } catch (err) {
          observer.error(err);
        }
      };

      es.onerror = (err) => {
        observer.error(err);
      };

      return () => es.close();
    });
  }
}
