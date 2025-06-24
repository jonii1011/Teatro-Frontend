import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { FidelizacionService, EstadisticasFidelizacion } from '../../services/fidelizacion';
import { EventoService } from '../../services/evento';
import { ClienteService } from '../../services/cliente';
import { ReservaService } from '../../services/reserva';
import { EventoResumen } from '../../models/evento';
import { Cliente } from '../../models/cliente';
import { Reserva, EstadoReserva } from '../../models/reserva';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTableModule,
    RouterLink
  ],
  template: `
    <div class="dashboard-container">
      <h1 class="dashboard-title">🎭 Dashboard - Teatro Gran Espectáculo</h1>
      
      <!-- Tarjetas de estadísticas -->
      <div class="stats-grid">
        <mat-card class="stat-card clients">
          <mat-card-header>
            <mat-icon mat-card-avatar>people</mat-icon>
            <mat-card-title>{{ estadisticas?.totalClientes || 0 }}</mat-card-title>
            <mat-card-subtitle>Clientes Totales</mat-card-subtitle>
          </mat-card-header>
          <mat-card-actions>
            <button mat-button routerLink="/clientes">Ver Clientes</button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="stat-card events">
          <mat-card-header>
            <mat-icon mat-card-avatar>event</mat-icon>
            <mat-card-title>{{ eventosVigentes.length || 0 }}</mat-card-title>
            <mat-card-subtitle>Eventos Vigentes</mat-card-subtitle>
          </mat-card-header>
          <mat-card-actions>
            <button mat-button routerLink="/eventos">Ver Eventos</button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="stat-card reservations">
          <mat-card-header>
            <mat-icon mat-card-avatar>confirmation_number</mat-icon>
            <mat-card-title>{{ reservasPendientes.length || 0 }}</mat-card-title>
            <mat-card-subtitle>Reservas Pendientes</mat-card-subtitle>
          </mat-card-header>
          <mat-card-actions>
            <button mat-button routerLink="/reservas">Ver Reservas</button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="stat-card loyalty">
          <mat-card-header>
            <mat-icon mat-card-avatar>star</mat-icon>
            <mat-card-title>{{ estadisticas?.clientesFrecuentes || 0 }}</mat-card-title>
            <mat-card-subtitle>Clientes Frecuentes</mat-card-subtitle>
          </mat-card-header>
          <mat-card-actions>
            <button mat-button routerLink="/fidelizacion">Ver Fidelización</button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Fidelización Progress -->
      <mat-card class="loyalty-progress-card" *ngIf="estadisticas">
        <mat-card-header>
          <mat-card-title>📈 Programa de Fidelización</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="progress-item">
            <span>Porcentaje de Fidelización</span>
            <mat-progress-bar 
              mode="determinate" 
              [value]="estadisticas.porcentajeFidelizacion"
              class="progress-bar">
            </mat-progress-bar>
            <span class="progress-value">{{ estadisticas.porcentajeFidelizacion }}%</span>
          </div>
          
          <div class="stats-row">
            <div class="stat-item">
              <strong>{{ estadisticas.totalPasesOtorgados }}</strong>
              <span>Pases Otorgados</span>
            </div>
            <div class="stat-item">
              <strong>{{ estadisticas.totalPasesUsados }}</strong>
              <span>Pases Usados</span>
            </div>
            <div class="stat-item">
              <strong>{{ estadisticas.promedioEventosPorCliente }}</strong>
              <span>Promedio Eventos/Cliente</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Eventos Próximos y Top Clientes -->
      <div class="info-grid">
        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>🎪 Próximos Eventos</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="eventosVigentes && eventosVigentes.length > 0; else noEventos">
              <div class="event-item" *ngFor="let evento of eventosVigentes.slice(0, 5)">
                <div class="event-info">
                  <strong>{{ evento.nombre }}</strong>
                  <span class="event-date">{{ formatDate(evento.fechaHora) }}</span>
                  <span class="event-type">{{ formatTipoEvento(evento.tipoEvento) }}</span>
                </div>
                <div class="event-availability">
                  <span class="availability-text">{{ evento.capacidadDisponible }}/{{ evento.capacidadTotal }}</span>
                </div>
              </div>
            </div>
            <ng-template #noEventos>
              <p class="no-data">No hay eventos próximos</p>
            </ng-template>
          </mat-card-content>
        </mat-card>

        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>⭐ Top Clientes Frecuentes</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="topClientes && topClientes.length > 0; else noClientes">
              <div class="client-item" *ngFor="let cliente of topClientes.slice(0, 5); let i = index">
                <div class="client-rank">{{ i + 1 }}</div>
                <div class="client-info">
                  <strong>{{ cliente.nombre }} {{ cliente.apellido }}</strong>
                  <span class="client-events">{{ cliente.eventosAsistidos || 0 }} eventos</span>
                </div>
                <div class="client-badges">
                  <span class="badge" *ngIf="cliente.pasesGratuitos && cliente.pasesGratuitos > 0">{{ cliente.pasesGratuitos }} 🎟️</span>
                  <span class="badge level">{{ getNivelCliente(cliente.eventosAsistidos || 0) }}</span>
                </div>
              </div>
            </div>
            <ng-template #noClientes>
              <p class="no-data">No hay clientes frecuentes</p>
            </ng-template>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .dashboard-title {
      text-align: center;
      margin-bottom: 30px;
      font-size: 2.5em;
      color: #333;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      text-align: center;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .stat-card.clients { border-left: 4px solid #4CAF50; }
    .stat-card.events { border-left: 4px solid #2196F3; }
    .stat-card.reservations { border-left: 4px solid #FF9800; }
    .stat-card.loyalty { border-left: 4px solid #9C27B0; }

    .stat-card mat-card-title {
      font-size: 2.5em;
      font-weight: bold;
    }

    .loyalty-progress-card {
      margin-bottom: 30px;
    }

    .progress-item {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
    }

    .progress-bar {
      flex: 1;
      height: 10px;
    }

    .progress-value {
      min-width: 50px;
      font-weight: bold;
      color: #9C27B0;
    }

    .stats-row {
      display: flex;
      justify-content: space-around;
      margin-top: 20px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-item strong {
      display: block;
      font-size: 1.5em;
      color: #9C27B0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }

    .event-item, .client-item {
      display: flex;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }

    .event-item:last-child, .client-item:last-child {
      border-bottom: none;
    }

    .event-info, .client-info {
      flex: 1;
    }

    .event-info strong, .client-info strong {
      display: block;
      margin-bottom: 5px;
    }

    .event-date, .event-type, .client-events {
      font-size: 0.9em;
      color: #666;
      margin-right: 10px;
    }

    .client-rank {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #3f51b5;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 15px;
    }

    .client-badges {
      display: flex;
      gap: 5px;
      flex-direction: column;
      align-items: flex-end;
    }

    .badge {
      background: #e3f2fd;
      color: #1976d2;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.8em;
    }

    .badge.level {
      background: #fff3e0;
      color: #f57c00;
    }

    .availability-text {
      color: #4CAF50;
      font-weight: bold;
    }

    .no-data {
      text-align: center;
      color: #666;
      font-style: italic;
    }
  `]
})
export class DashboardComponent implements OnInit {
  estadisticas: EstadisticasFidelizacion | null = null;
  eventosVigentes: EventoResumen[] = [];
  topClientes: Cliente[] = [];
  reservasPendientes: Reserva[] = [];

  constructor(
    private fidelizacionService: FidelizacionService,
    private eventoService: EventoService,
    private clienteService: ClienteService,
    private reservaService: ReservaService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    console.log('Iniciando carga de datos...');

    // Cargar estadísticas de fidelización
    this.fidelizacionService.obtenerEstadisticasFidelizacion().subscribe({
      next: (data) => {
        console.log('Estadísticas cargadas:', data);
        this.estadisticas = data;
      },
      error: (error) => console.error('Error cargando estadísticas:', error)
    });

    // Cargar eventos vigentes
    this.eventoService.obtenerEventosVigentes().subscribe({
      next: (data) => {
        console.log('Eventos vigentes cargados:', data);
        this.eventosVigentes = data;
      },
      error: (error) => console.error('Error cargando eventos:', error)
    });

    // Cargar top clientes
    this.fidelizacionService.obtenerRankingClientesFrecuentes().subscribe({
      next: (data) => {
        console.log('Top clientes cargados:', data);
        this.topClientes = data;
      },
      error: (error) => console.error('Error cargando clientes:', error)
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTipoEvento(tipo: string): string {
    const tipos: {[key: string]: string} = {
      'OBRA_TEATRO': 'Teatro',
      'RECITAL': 'Recital',
      'CHARLA_CONFERENCIA': 'Conferencia'
    };
    return tipos[tipo] || tipo;
  }

  getNivelCliente(eventos: number): string {
    if (eventos >= 20) return '🏆 Gold';
    if (eventos >= 10) return '🥈 Silver';
    if (eventos >= 5) return '🥉 Bronze';
    return '⭐ Nuevo';
  }
}