import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { ClientesComponent } from './components/clientes/clientes';
import { EventosComponent } from './components/eventos/eventos';
import { ReservasComponent } from './components/reservas/reservas';
import { CrearReservaComponent } from './components/reservas/reserva-form/reserva-form';
import { FidelizacionComponent } from './components/fidelizacion/fidelizacion';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'eventos', component: EventosComponent },
  { path: 'reservas', component: ReservasComponent },
  { path: 'reservas/crear', component: CrearReservaComponent },
  { path: 'fidelizacion', component: FidelizacionComponent },
  { path: '**', redirectTo: '/dashboard' }
];
