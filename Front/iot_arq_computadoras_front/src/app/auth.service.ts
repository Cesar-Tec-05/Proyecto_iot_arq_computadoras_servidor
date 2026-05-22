import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'auth_token';
  readonly username = signal<string | null>(null);

  constructor(private http: HttpClient) {
    const existing = this.getToken();
    if (existing) {
      this.username.set('sesion_activa');
    }
  }

  async login(username: string, password: string) {
    const result = await firstValueFrom(
      this.http.post<LoginResponse>('/api/auth/login', { username, password }),
    );

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.tokenKey, result.accessToken);
    }
    this.username.set(result.user.username);
    return result;
  }

  async register(username: string, password: string) {
    await firstValueFrom(this.http.post('/api/auth/register', { username, password }));
  }

  logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
    this.username.set(null);
  }

  getToken() {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  async isSessionValid() {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const user = await firstValueFrom(
        this.http.get<LoginResponse['user']>('/api/auth/me'),
      );
      this.username.set(user.username);
      return true;
    } catch (error: any) {
      if (error?.status === 401) {
        this.logout();
      }
      return false;
    }
  }
}
