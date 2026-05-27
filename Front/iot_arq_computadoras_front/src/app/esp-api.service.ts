import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type LedState = 'on' | 'off';

export interface EspLogEntry {
  _id?: string;
  action: LedState;
  source: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class EspApiService {
  private readonly http = inject(HttpClient);

  toggleLed(state: LedState) {
    return this.http.get('/api/esp/rele', {
      params: { state },
    });
  }

  getLogs() {
    return this.http.get<EspLogEntry[]>('/api/esp/logs');
  }
}
