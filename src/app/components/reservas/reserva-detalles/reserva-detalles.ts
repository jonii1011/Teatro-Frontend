import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Reserva, EstadoReserva } from '../../../models/reserva';
import { TipoEntrada } from '../../../models/evento';
import { ReservaService } from '../../../services/reserva';

@Component({
  selector: 'app-reserva-detalles',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule
  ],
  template: `
    <div class="reserva-detalles-container">
      <!-- Header -->
      <div class="header-section">
        <div class="reserva-icon-large">
          <mat-icon>{{ getIconoTipoEntrada(reserva.tipoEntrada) }}</mat-icon>
        </div>
        <div class="reserva-titulo">
          <h2 mat-dialog-title>Reserva {{ reserva.codigoReserva }}</h2>
          <div class="badges-container">
            <mat-chip class="estado-chip" [ngClass]="getClaseEstado()">
              <mat-icon>{{ getIconoEstado(reserva.estado) }}</mat-icon>
              {{ getNombreEstado(reserva.estado) }}
            </mat-chip>
            <mat-chip *ngIf="reserva.esPaseGratuito" class="pase-chip">
              <mat-icon>card_giftcard</mat-icon>
              Pase Gratuito
            </mat-chip>
            <mat-chip *ngIf="reserva.estaVigente" class="vigente-chip">
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
                  <mat-icon class="info-icon">confirmation_number</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Código de Reserva</span>
                    <span class="info-value">{{ reserva.codigoReserva }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <mat-icon class="info-icon">event</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Evento</span>
                    <span class="info-value">{{ reserva.evento.nombre }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <mat-icon class="info-icon">calendar_today</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Fecha del Evento</span>
                    <span class="info-value">{{ formatearFecha(reserva.evento.fechaHora) }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <mat-icon class="info-icon">access_time</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Hora del Evento</span>
                    <span class="info-value">{{ formatearHora(reserva.evento.fechaHora) }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <mat-icon class="info-icon">local_activity</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Tipo de Entrada</span>
                    <span class="info-value">{{ getNombreTipoEntrada(reserva.tipoEntrada) }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <mat-icon class="info-icon">attach_money</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Precio</span>
                    <span class="info-value" [class.gratis]="reserva.esPaseGratuito">
                      {{ reserva.esPaseGratuito ? 'Pase Gratuito' : '$' + (reserva.precioPagado || 0) }}
                    </span>
                  </div>
                </div>

                <div class="info-item">
                  <mat-icon class="info-icon">schedule</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Fecha de Reserva</span>
                    <span class="info-value">{{ formatearFechaHora(reserva.fechaReserva) }}</span>
                  </div>
                </div>

                <div class="info-item" *ngIf="reserva.fechaConfirmacion">
                  <mat-icon class="info-icon">check_circle</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Fecha de Confirmación</span>
                    <span class="info-value">{{ formatearFechaHora(reserva.fechaConfirmacion) }}</span>
                  </div>
                </div>

                <div class="info-item" *ngIf="reserva.fechaCancelacion">
                  <mat-icon class="info-icon">cancel</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Fecha de Cancelación</span>
                    <span class="info-value">{{ formatearFechaHora(reserva.fechaCancelacion) }}</span>
                  </div>
                </div>

                <div class="info-item" *ngIf="reserva.motivoCancelacion">
                  <mat-icon class="info-icon">comment</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Motivo de Cancelación</span>
                    <span class="info-value">{{ reserva.motivoCancelacion }}</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Tab: Cliente -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>person</mat-icon>
              Cliente
            </ng-template>
            
            <div class="tab-content">
              <div class="cliente-section">
                <div class="cliente-avatar">
                  <mat-icon>person</mat-icon>
                </div>
                <div class="cliente-info">
                  <h3>{{ reserva.cliente.nombre }} {{ reserva.cliente.apellido }}</h3>
                  <div class="cliente-detalles">
                    <div class="detalle-item">
                      <mat-icon>email</mat-icon>
                      <span>{{ reserva.cliente.email }}</span>
                    </div>
                    <div class="detalle-item" *ngIf="reserva.cliente.eventosAsistidos">
                      <mat-icon>event_seat</mat-icon>
                      <span>{{ reserva.cliente.eventosAsistidos }} eventos asistidos</span>
                    </div>
                    <div class="detalle-item" *ngIf="reserva.cliente.pasesGratuitos">
                      <mat-icon>card_giftcard</mat-icon>
                      <span>{{ reserva.cliente.pasesGratuitos }} pases gratuitos disponibles</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Tab: Estado y Acciones -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>settings</mat-icon>
              Estado y Acciones
            </ng-template>
            
            <div class="tab-content">
              <div class="estado-section">
                <div class="estado-actual">
                  <h3>Estado Actual</h3>
                  <div class="estado-badge" [ngClass]="getClaseEstado()">
                    <mat-icon>{{ getIconoEstado(reserva.estado) }}</mat-icon>
                    <span>{{ getNombreEstado(reserva.estado) }}</span>
                  </div>
                  <p class="estado-descripcion">{{ getDescripcionEstado() }}</p>
                </div>

                <mat-divider *ngIf="puedeCancelar()"></mat-divider>

                <div class="acciones-disponibles" *ngIf="puedeCancelar()">
                  <h3>Acciones Disponibles</h3>
                  <div class="acciones-grid">
                    <button mat-raised-button 
                            color="warn"
                            (click)="cancelarReserva()">
                      <mat-icon>cancel</mat-icon>
                      Cancelar Reserva
                    </button>
                  </div>
                </div>

                <div class="tiempo-info" *ngIf="reserva.estado === EstadoReserva.CONFIRMADA">
                  <h3>Información del Evento</h3>
                  <div class="tiempo-restante">
                    <mat-icon>schedule</mat-icon>
                    <span>{{ getTiempoRestante() }}</span>
                  </div>
                </div>
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
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .reserva-detalles-container {
      width: 100%;
      max-width: 700px;
      min-height: 500px;
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

    .reserva-icon-large {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      box-shadow: 0 4px 12px rgba(0,123,255,0.3);
    }

    .reserva-icon-large mat-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
    }

    .reserva-titulo {
      flex: 1;
    }

    .reserva-titulo h2 {
      margin: 0 0 12px 0;
      color: #212121;
      font-size: 1.6rem;
      font-weight: 500;
    }

    .badges-container {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .estado-chip, .pase-chip, .vigente-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      height: 32px;
      padding: 6px 12px;
      border-radius: 16px;
      font-weight: 500;
    }

    .estado-chip.confirmada {
      background: #e8f5e8;
      color: #2e7d32;
      border: 1px solid #c8e6c9;
    }

    .estado-chip.cancelada {
      background: #ffebee;
      color: #c62828;
      border: 1px solid #ffcdd2;
    }

    .pase-chip {
      background: #fff8e1;
      color: #f57c00;
      border: 1px solid #ffecb3;
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
      max-height: 60vh;
      overflow-y: auto;
    }

    .tab-content {
      padding: 24px;
    }

    /* Información General */
    .info-grid {
      display: grid;
      gap: 16px;
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

    .info-value.gratis {
      color: #f57c00;
      font-weight: bold;
    }

    /* Cliente */
    .cliente-section {
      display: flex;
      gap: 20px;
      align-items: start;
    }

    .cliente-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #e3f2fd;
      color: #1976d2;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
    }

    .cliente-avatar mat-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
    }

    .cliente-info {
      flex: 1;
    }

    .cliente-info h3 {
      margin: 0 0 16px 0;
      color: #212121;
      font-size: 1.4rem;
    }

    .cliente-detalles {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .detalle-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
    }

    .detalle-item mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
      color: #007bff;
    }

    /* Estado y Acciones */
    .estado-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .estado-actual {
      text-align: center;
    }

    .estado-actual h3 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .estado-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 24px;
      font-size: 1.1rem;
      font-weight: 500;
      margin-bottom: 12px;
    }

    .estado-badge.confirmada {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .estado-badge.cancelada {
      background: #ffebee;
      color: #c62828;
    }

    .estado-descripcion {
      color: #666;
      margin: 0;
    }

    .acciones-disponibles h3 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .acciones-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .acciones-grid button {
      justify-content: flex-start;
      gap: 8px;
    }

    .tiempo-info h3 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .tiempo-restante {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      color: #007bff;
      font-weight: 500;
    }

    .dialog-actions {
      padding: 16px 24px;
      background: #fafafa;
      border-top: 1px solid #e0e0e0;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .reserva-detalles-container {
        max-width: 100%;
      }

      .header-section {
        padding: 16px;
      }

      .reserva-icon-large {
        width: 60px;
        height: 60px;
        font-size: 2rem;
      }

      .reserva-icon-large mat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
      }

      .reserva-titulo h2 {
        font-size: 1.3rem;
      }

      .tab-content {
        padding: 16px;
      }

      .cliente-section {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class ReservaDetallesComponent {
  EstadoReserva = EstadoReserva;

  // Mapeos para UI
  estadosNombres = {
    [EstadoReserva.CONFIRMADA]: 'Confirmada',
    [EstadoReserva.CANCELADA]: 'Cancelada'
  };

  estadosIconos = {
    [EstadoReserva.CONFIRMADA]: 'check_circle',
    [EstadoReserva.CANCELADA]: 'cancel'
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
    public dialogRef: MatDialogRef<ReservaDetallesComponent>,
    @Inject(MAT_DIALOG_DATA) public reserva: Reserva,
    private reservaService: ReservaService,
    private snackBar: MatSnackBar
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

  getNombreEstado(estado: EstadoReserva): string {
    return this.estadosNombres[estado];
  }

  getIconoEstado(estado: EstadoReserva): string {
    return this.estadosIconos[estado];
  }

  getNombreTipoEntrada(tipo: TipoEntrada): string {
    return this.tiposEntradaNombres[tipo];
  }

  getIconoTipoEntrada(tipo: TipoEntrada): string {
    return this.tiposEntradaIconos[tipo];
  }

  getClaseEstado(): string {
    return this.reserva.estado.toLowerCase();
  }

  getDescripcionEstado(): string {
    switch (this.reserva.estado) {
      case EstadoReserva.CONFIRMADA:
        return 'La reserva está confirmada y activa.';
      case EstadoReserva.CANCELADA:
        return 'La reserva ha sido cancelada.';
      default:
        return '';
    }
  }

  getTiempoRestante(): string {
    const fechaEvento = new Date(this.reserva.evento.fechaHora);
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

  // Método de validación para acciones
  puedeCancelar(): boolean {
    return this.reserva.puedeSerCancelada || 
           (this.reserva.estado === EstadoReserva.CONFIRMADA && 
            new Date(this.reserva.evento.fechaHora) > new Date());
  }

  // Método de acción
  cancelarReserva(): void {
    const motivo = prompt('Ingrese el motivo de cancelación:');
    if (motivo && this.reserva.id) {
      this.reservaService.cancelarReserva(this.reserva.id, motivo).subscribe({
        next: (reservaActualizada) => {
          this.reserva = reservaActualizada;
          this.snackBar.open('Reserva cancelada exitosamente', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error al cancelar reserva:', error);
          this.snackBar.open('Error al cancelar la reserva', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }
}