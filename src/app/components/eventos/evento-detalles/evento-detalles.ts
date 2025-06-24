import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';

import { Evento, TipoEvento, TipoEntrada } from '../../../models/evento';

interface EntradaDetalle {
  tipo: TipoEntrada;
  precio: number;
  capacidad: number;
  reservadas: number;
  disponibles: number;
}

@Component({
  selector: 'app-evento-detalles',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule,
    MatTabsModule
  ],
  template: `
    <div class="evento-detalles-container">
      <!-- Header -->
      <div class="header-section">
        <div class="evento-icon-large">
          <mat-icon>{{ getIconoTipoEvento(evento.tipoEvento) }}</mat-icon>
        </div>
        <div class="evento-titulo">
          <h2 mat-dialog-title>{{ evento.nombre }}</h2>
          <div class="badges-container">
            <mat-chip class="tipo-chip" [ngClass]="getTipoClase()">
              <mat-icon>{{ getIconoTipoEvento(evento.tipoEvento) }}</mat-icon>
              {{ getNombreTipoEvento(evento.tipoEvento) }}
            </mat-chip>
            <mat-chip class="estado-chip" 
                     [class.activo]="evento.activo !== false"
                     [class.inactivo]="evento.activo === false">
              <mat-icon>{{ evento.activo !== false ? 'check_circle' : 'cancel' }}</mat-icon>
              {{ evento.activo !== false ? 'Activo' : 'Inactivo' }}
            </mat-chip>
            <mat-chip *ngIf="esEventoVigente()" class="vigente-chip">
              <mat-icon>event_available</mat-icon>
              Vigente
            </mat-chip>
          </div>
        </div>
        <button mat-icon-button 
                mat-dialog-close 
                class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <mat-tab-group class="detalles-tabs">
          
          <!-- Tab: Información General -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>info</mat-icon>
              Información General
            </ng-template>
            
            <div class="tab-content">
              <div class="info-grid">
                <div class="info-item">
                  <mat-icon class="info-icon">description</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Descripción</span>
                    <span class="info-value">{{ evento.descripcion }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <mat-icon class="info-icon">calendar_today</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Fecha</span>
                    <span class="info-value">{{ formatearFecha(evento.fechaHora) }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <mat-icon class="info-icon">access_time</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Hora</span>
                    <span class="info-value">{{ formatearHora(evento.fechaHora) }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <mat-icon class="info-icon">people</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Capacidad Total</span>
                    <span class="info-value">{{ evento.capacidadTotal }} personas</span>
                  </div>
                </div>

                <div class="info-item" *ngIf="evento.fechaCreacion">
                  <mat-icon class="info-icon">schedule</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Fecha de Creación</span>
                    <span class="info-value">{{ formatearFechaHora(evento.fechaCreacion) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Tab: Entradas y Precios -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>confirmation_number</mat-icon>
              Entradas
            </ng-template>
            
            <div class="tab-content">
              <div class="entradas-section">
                <h3>
                  <mat-icon>local_activity</mat-icon>
                  Tipos de Entrada Disponibles
                </h3>
                
                <div class="entradas-grid" *ngIf="getEntradasDisponibles().length > 0; else noEntradas">
                  <div *ngFor="let entrada of getEntradasDisponibles()" class="entrada-card">
                    <div class="entrada-header">
                      <mat-icon>{{ getIconoTipoEntrada(entrada.tipo) }}</mat-icon>
                      <h4>{{ getNombreTipoEntrada(entrada.tipo) }}</h4>
                    </div>
                    <div class="entrada-info">
                      <div class="precio">
                        <span class="precio-label">Precio:</span>
                        <span class="precio-valor">\${{ entrada.precio | number:'1.0-0' }}</span>
                      </div>
                      <div class="capacidad">
                        <span class="capacidad-label">Capacidad:</span>
                        <span class="capacidad-valor">{{ entrada.capacidad }}</span>
                      </div>
                      <div class="disponibilidad">
                        <span class="disponibilidad-label">Disponibles:</span>
                        <span class="disponibilidad-valor">{{ entrada.disponibles }}</span>
                      </div>
                    </div>
                    <div class="entrada-barra">
                      <div class="barra-progreso">
                        <div class="barra-ocupada" 
                             [style.width.%]="getPorcentajeOcupado(entrada)">
                        </div>
                      </div>
                      <small>{{ getPorcentajeOcupado(entrada) }}% ocupado</small>
                    </div>
                  </div>
                </div>

                <ng-template #noEntradas>
                  <div class="no-entradas">
                    <mat-icon>event_busy</mat-icon>
                    <p>No hay información de entradas disponible</p>
                  </div>
                </ng-template>
              </div>
            </div>
          </mat-tab>

          <!-- Tab: Estadísticas -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>analytics</mat-icon>
              Estadísticas
            </ng-template>
            
            <div class="tab-content">
              <div class="estadisticas-section">
                <!-- Estadísticas principales -->
                <div class="stats-grid">
                  <div class="stat-card reservas">
                    <div class="stat-icon">
                      <mat-icon>event_seat</mat-icon>
                    </div>
                    <div class="stat-content">
                      <div class="stat-number">{{ getTotalReservasActivas() }}</div>
                      <div class="stat-label">Reservas Activas</div>
                    </div>
                  </div>

                  <div class="stat-card disponibles">
                    <div class="stat-icon">
                      <mat-icon>event_available</mat-icon>
                    </div>
                    <div class="stat-content">
                      <div class="stat-number">{{ getCapacidadDisponible() }}</div>
                      <div class="stat-label">Lugares Disponibles</div>
                    </div>
                  </div>

                  <div class="stat-card ingresos">
                    <div class="stat-icon">
                      <mat-icon>attach_money</mat-icon>
                    </div>
                    <div class="stat-content">
                      <div class="stat-number">\${{ getIngresosEstimados() | number:'1.0-0' }}</div>
                      <div class="stat-label">Ingresos Estimados</div>
                    </div>
                  </div>
                </div>

                <!-- Progreso de ocupación -->
                <div class="ocupacion-section">
                  <h3>
                    <mat-icon>trending_up</mat-icon>
                    Ocupación del Evento
                  </h3>
                  <div class="ocupacion-contenido">
                    <div class="ocupacion-info">
                      <span>{{ getTotalReservasActivas() }} / {{ evento.capacidadTotal }} lugares</span>
                      <span class="ocupacion-porcentaje">{{ getPorcentajeOcupacion() }}%</span>
                    </div>
                    <mat-progress-bar 
                      mode="determinate" 
                      [value]="getPorcentajeOcupacion()"
                      class="ocupacion-bar">
                    </mat-progress-bar>
                    <p class="ocupacion-descripcion">
                      {{ getDescripcionOcupacion() }}
                    </p>
                  </div>
                </div>

                <!-- Estado del evento -->
                <div class="estado-section">
                  <h3>
                    <mat-icon>event_note</mat-icon>
                    Estado del Evento
                  </h3>
                  <div class="estado-info">
                    <div class="estado-item">
                      <span class="estado-label">Tiempo restante:</span>
                      <span class="estado-valor">{{ getTiempoRestante() }}</span>
                    </div>
                    <div class="estado-item">
                      <span class="estado-label">Estado de venta:</span>
                      <span class="estado-valor" [ngClass]="getClaseEstadoVenta()">
                        {{ getEstadoVenta() }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Tab: Actividad Reciente -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>history</mat-icon>
              Actividad
            </ng-template>
            
            <div class="tab-content">
              <div class="actividad-placeholder">
                <mat-icon class="placeholder-icon">event_note</mat-icon>
                <h3>Historial de Reservas</h3>
                <p>Aquí se mostrará el historial de reservas y actividad del evento</p>
                <button mat-raised-button color="primary">
                  <mat-icon>visibility</mat-icon>
                  Ver Reservas Completas
                </button>
              </div>
            </div>
          </mat-tab>

        </mat-tab-group>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button mat-dialog-close>
          <mat-icon>close</mat-icon>
          Cerrar
        </button>
        <button mat-raised-button color="primary" (click)="editarEvento()">
          <mat-icon>edit</mat-icon>
          Editar Evento
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .evento-detalles-container {
      width: 100%;
      max-width: 800px;
      min-height: 600px;
    }

    .header-section {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-bottom: 1px solid #e0e0e0;
      position: relative;
    }

    .evento-icon-large {
      width: 80px;
      height: 80px;
      border-radius: 20px;
      background: linear-gradient(135deg, #000 0%, #333 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .evento-icon-large mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
    }

    .evento-titulo {
      flex: 1;
    }

    .evento-titulo h2 {
      margin: 0 0 12px 0;
      color: #212121;
      font-size: 1.8rem;
      font-weight: 500;
    }

    .badges-container {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .tipo-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      height: 32px;
      padding: 6px 12px;
      border-radius: 16px;
      font-weight: 500;
    }

    .tipo-chip.teatro {
      background: #fff3e0;
      color: #f57c00;
      border: 1px solid #ffe0b2;
    }

    .tipo-chip.recital {
      background: #f3e5f5;
      color: #7b1fa2;
      border: 1px solid #e1bee7;
    }

    .tipo-chip.conferencia {
      background: #e8f5e8;
      color: #2e7d32;
      border: 1px solid #c8e6c9;
    }

    .estado-chip, .vigente-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      height: 32px;
      padding: 6px 12px;
      border-radius: 16px;
      font-weight: 500;
    }

    .estado-chip.activo {
      background: #e8f5e8;
      color: #2e7d32;
      border: 1px solid #c8e6c9;
    }

    .estado-chip.inactivo {
      background: #ffebee;
      color: #c62828;
      border: 1px solid #ffcdd2;
    }

    .vigente-chip {
      background: #e3f2fd;
      color: #1976d2;
      border: 1px solid #bbdefb;
    }

    .close-button {
      position: absolute;
      top: 16px;
      right: 16px;
      color: #666;
    }

    .dialog-content {
      padding: 0;
      max-height: 70vh;
      overflow-y: auto;
    }

    .tab-content {
      padding: 24px;
    }

    /* Información General */
    .info-grid {
      display: grid;
      gap: 20px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 12px;
      border-left: 4px solid #007bff;
    }

    .info-icon {
      color: #007bff;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .info-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-label {
      font-size: 0.85rem;
      color: #666;
      text-transform: uppercase;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 1rem;
      color: #212121;
      font-weight: 500;
    }

    /* Entradas */
    .entradas-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .entradas-section h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      color: #333;
      font-size: 1.1rem;
    }

    .entradas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .entrada-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border: 1px solid #e0e0e0;
    }

    .entrada-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }

    .entrada-header h4 {
      margin: 0;
      color: #333;
      font-size: 1rem;
    }

    .entrada-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .precio, .capacidad, .disponibilidad {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .precio-valor {
      color: #2e7d32;
      font-weight: bold;
      font-size: 1.1rem;
    }

    .entrada-barra {
      text-align: center;
    }

    .barra-progreso {
      width: 100%;
      height: 6px;
      background: #f0f0f0;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 4px;
    }

    .barra-ocupada {
      height: 100%;
      background: linear-gradient(90deg, #ff9800, #f57c00);
      transition: width 0.3s ease;
    }

    .no-entradas {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .no-entradas mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #ccc;
      margin-bottom: 16px;
    }

    /* Estadísticas */
    .estadisticas-section {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-left: 4px solid;
    }

    .stat-card.reservas {
      border-left-color: #007bff;
    }

    .stat-card.disponibles {
      border-left-color: #28a745;
    }

    .stat-card.ingresos {
      border-left-color: #ffc107;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
    }

    .stat-card.reservas .stat-icon {
      background: #e3f2fd;
      color: #007bff;
    }

    .stat-card.disponibles .stat-icon {
      background: #e8f5e8;
      color: #28a745;
    }

    .stat-card.ingresos .stat-icon {
      background: #fff8e1;
      color: #ffc107;
    }

    .stat-content {
      flex: 1;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #212121;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #666;
      margin-top: 4px;
    }

    .ocupacion-section, .estado-section {
      background: #f8f9fa;
      padding: 24px;
      border-radius: 12px;
      border-left: 4px solid #007bff;
    }

    .ocupacion-section h3, .estado-section h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      color: #007bff;
      font-size: 1.1rem;
    }

    .ocupacion-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-weight: 500;
    }

    .ocupacion-porcentaje {
      color: #007bff;
      font-weight: bold;
    }

    .ocupacion-bar {
      height: 10px;
      border-radius: 5px;
      margin-bottom: 12px;
    }

    .ocupacion-descripcion {
      font-size: 0.9rem;
      color: #666;
      margin: 0;
      text-align: center;
    }

    .estado-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .estado-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .estado-label {
      color: #666;
      font-weight: 500;
    }

    .estado-valor {
      font-weight: bold;
    }

    .estado-valor.disponible {
      color: #28a745;
    }

    .estado-valor.limitado {
      color: #ffc107;
    }

    .estado-valor.agotado {
      color: #dc3545;
    }

    /* Actividad */
    .actividad-placeholder {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .placeholder-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
      margin-bottom: 20px;
    }

    .dialog-actions {
      padding: 16px 24px;
      background: #fafafa;
      border-top: 1px solid #e0e0e0;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .evento-detalles-container {
        max-width: 100%;
      }

      .header-section {
        padding: 16px;
      }

      .evento-icon-large {
        width: 60px;
        height: 60px;
        font-size: 2rem;
      }

      .evento-icon-large mat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
      }

      .evento-titulo h2 {
        font-size: 1.4rem;
      }

      .tab-content {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .entradas-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EventoDetallesComponent {
  // Mapeos para UI
  tiposEventoNombres = {
    [TipoEvento.OBRA_TEATRO]: 'Obra de Teatro',
    [TipoEvento.RECITAL]: 'Recital',
    [TipoEvento.CHARLA_CONFERENCIA]: 'Charla/Conferencia'
  };

  tiposEventoIconos = {
    [TipoEvento.OBRA_TEATRO]: 'theater_comedy',
    [TipoEvento.RECITAL]: 'music_note',
    [TipoEvento.CHARLA_CONFERENCIA]: 'school'
  };

  tiposEntradaNombres = {
    [TipoEntrada.GENERAL]: 'General',
    [TipoEntrada.VIP]: 'VIP',
    [TipoEntrada.CAMPO]: 'Campo',
    [TipoEntrada.PLATEA]: 'Platea',
    [TipoEntrada.PALCO]: 'Palco',
    [TipoEntrada.CON_MEET_GREET]: 'Con Meet & Greet',
    [TipoEntrada.SIN_MEET_GREET]: 'Sin Meet & Greet'
  };

  tiposEntradaIconos = {
    [TipoEntrada.GENERAL]: 'event_seat',
    [TipoEntrada.VIP]: 'star',
    [TipoEntrada.CAMPO]: 'grass',
    [TipoEntrada.PLATEA]: 'weekend',
    [TipoEntrada.PALCO]: 'balcony',
    [TipoEntrada.CON_MEET_GREET]: 'handshake',
    [TipoEntrada.SIN_MEET_GREET]: 'event_seat'
  };

  constructor(
    public dialogRef: MatDialogRef<EventoDetallesComponent>,
    @Inject(MAT_DIALOG_DATA) public evento: Evento
  ) {}

  formatearFecha(fecha: string): string {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearHora(fecha: string): string {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearFechaHora(fecha: string | undefined): string {
    if (!fecha) return 'No especificada';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getNombreTipoEvento(tipo: TipoEvento): string {
    return this.tiposEventoNombres[tipo];
  }

  getIconoTipoEvento(tipo: TipoEvento): string {
    return this.tiposEventoIconos[tipo];
  }

  getNombreTipoEntrada(tipo: TipoEntrada): string {
    return this.tiposEntradaNombres[tipo];
  }

  getIconoTipoEntrada(tipo: TipoEntrada): string {
    return this.tiposEntradaIconos[tipo];
  }

  getTipoClase(): string {
    switch (this.evento.tipoEvento) {
      case TipoEvento.OBRA_TEATRO: return 'teatro';
      case TipoEvento.RECITAL: return 'recital';
      case TipoEvento.CHARLA_CONFERENCIA: return 'conferencia';
      default: return '';
    }
  }

  // ✅ MÉTODO CORREGIDO para usar disponibilidadPorTipo
  getEntradasDisponibles(): EntradaDetalle[] {
    const entradas: EntradaDetalle[] = [];
    
    if (this.evento.precios && this.evento.capacidades) {
      Object.keys(this.evento.precios).forEach(tipoEntrada => {
        const tipo = tipoEntrada as TipoEntrada;
        const capacidad = this.evento.capacidades![tipo] || 0;
        
        // Usar disponibilidadPorTipo si está disponible, sino calcular
        let disponibles = capacidad;
        if (this.evento.disponibilidadPorTipo && this.evento.disponibilidadPorTipo[tipo] !== undefined) {
          disponibles = this.evento.disponibilidadPorTipo[tipo];
        } else {
          // Estimación proporcional basada en totalReservasActivas
          const totalReservas = this.getTotalReservasActivas();
          const proporcion = capacidad / this.evento.capacidadTotal;
          const reservadasEstimadas = Math.floor(totalReservas * proporcion);
          disponibles = Math.max(0, capacidad - reservadasEstimadas);
        }
        
        const reservadas = capacidad - disponibles;
        
        entradas.push({
          tipo,
          precio: this.evento.precios![tipo],
          capacidad,
          reservadas: Math.max(0, reservadas),
          disponibles: Math.max(0, disponibles)
        });
      });
    }
    
    return entradas;
  }

  getPorcentajeOcupado(entrada: EntradaDetalle): number {
    if (entrada.capacidad === 0) return 0;
    return Math.round((entrada.reservadas / entrada.capacidad) * 100);
  }

  // ✅ MÉTODO CORREGIDO para obtener total de reservas activas
  getTotalReservasActivas(): number {
    return this.evento.totalReservasActivas || 0;
  }

  getCapacidadDisponible(): number {
    const ocupadas = this.getTotalReservasActivas();
    return Math.max(0, this.evento.capacidadTotal - ocupadas);
  }

  getPorcentajeOcupacion(): number {
    const ocupadas = this.getTotalReservasActivas();
    if (this.evento.capacidadTotal === 0) return 0;
    return Math.round((ocupadas / this.evento.capacidadTotal) * 100);
  }

  // ✅ MÉTODO CORREGIDO para calcular ingresos estimados
  getIngresosEstimados(): number {
    let total = 0;
    const entradas = this.getEntradasDisponibles();
    
    entradas.forEach(entrada => {
      total += entrada.precio * entrada.reservadas;
    });
    
    return total;
  }

  getTiempoRestante(): string {
    const fechaEvento = new Date(this.evento.fechaHora);
    const ahora = new Date();
    const diffMs = fechaEvento.getTime() - ahora.getTime();
    
    if (diffMs < 0) return 'Evento finalizado';
    
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHoras = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDias > 0) return `${diffDias} días, ${diffHoras} horas`;
    if (diffHoras > 0) return `${diffHoras} horas`;
    
    const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffMinutos} minutos`;
  }

  getEstadoVenta(): string {
    const porcentaje = this.getPorcentajeOcupacion();
    if (porcentaje >= 95) return 'Agotado';
    if (porcentaje >= 80) return 'Pocas entradas';
    if (porcentaje >= 50) return 'Buena demanda';
    return 'Disponible';
  }

  getClaseEstadoVenta(): string {
    const porcentaje = this.getPorcentajeOcupacion();
    if (porcentaje >= 95) return 'agotado';
    if (porcentaje >= 80) return 'limitado';
    return 'disponible';
  }

  getDescripcionOcupacion(): string {
    const porcentaje = this.getPorcentajeOcupacion();
    if (porcentaje >= 95) return 'El evento está prácticamente agotado';
    if (porcentaje >= 80) return 'Quedan pocas entradas disponibles';
    if (porcentaje >= 50) return 'El evento tiene buena demanda';
    if (porcentaje >= 20) return 'Aún hay buena disponibilidad';
    return 'El evento recién comienza a tener reservas';
  }

  // ✅ MÉTODO CORREGIDO para verificar si está vigente
  esEventoVigente(): boolean {
    // Si el backend proporciona estaVigente, usarlo
    if (this.evento.estaVigente !== undefined) {
      return this.evento.estaVigente;
    }
    
    // Sino, calcularlo manualmente
    const fechaEvento = new Date(this.evento.fechaHora);
    const ahora = new Date();
    return this.evento.activo !== false && fechaEvento > ahora;
  }

  editarEvento(): void {
    this.dialogRef.close({ action: 'edit', evento: this.evento });
  }
}