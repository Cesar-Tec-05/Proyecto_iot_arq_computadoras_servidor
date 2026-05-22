import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { LoginPageComponent } from './pages/login-page.component';
import { RegisterPageComponent } from './pages/register-page.component';
import { DashboardPageComponent } from './pages/dashboard-page.component';

export const routes: Routes = [
	{ path: 'login', component: LoginPageComponent },
	{ path: 'register', component: RegisterPageComponent },
	{ path: 'dashboard', component: DashboardPageComponent, canActivate: [authGuard] },
	{ path: '', pathMatch: 'full', redirectTo: 'dashboard' },
	{ path: '**', redirectTo: 'dashboard' },
];
