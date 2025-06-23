// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { ClientesComponent } from './components/clientes/clientes'; // ← Esta línea
import { Eventos } from './components/eventos/eventos';
import { Reservas } from './components/reservas/reservas';
import { Fidelizacion } from './components/fidelizacion/fidelizacion';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'clientes', component: ClientesComponent }, // ← Esta línea
  { path: 'eventos', component: Eventos },
  { path: 'reservas', component: Reservas },
  { path: 'fidelizacion', component: Fidelizacion },
  { path: '**', redirectTo: '/dashboard' }
];
