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

import { Cliente } from '../../../models/cliente';

@Component({
  selector: 'app-cliente-detalles',
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
    <div class="cliente-detalles-container">
      <!-- Header -->
      <div class="header-section">
        <div class="cliente-avatar-large">
          {{ obtenerIniciales(cliente.nombre, cliente.apellido) }}
        </div>
        <div class="cliente-titulo">
          <h2 mat-dialog-title>{{ cliente.nombre }} {{ cliente.apellido }}</h2>
          <div class="badges-container">
            <mat-chip class="estado-chip" 
                     [class.activo]="cliente.activo !== false"
                     [class.inactivo]="cliente.activo === false">
              <mat-icon>{{ cliente.activo !== false ? 'check_circle' : 'cancel' }}</mat-icon>
              {{ cliente.activo !== false ? 'Activo' : 'Inactivo' }}
            </mat-chip>
            <mat-chip *ngIf="cliente.esClienteFrecuente" class="frecuente-chip">
              <mat-icon>star</mat-icon>
              Cliente Frecuente
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
          
          <!-- Tab: Información Personal -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>person</mat-icon>
              Información Personal
            </ng-template>
            
            <div class="tab-content">
              <div class="info-grid">
                <div class="info-item">
                  <mat-icon class="info-icon">email</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Email</span>
                    <span class="info-value">{{ cliente.email }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <mat-icon class="info-icon">badge</mat-icon>
                  <div class="info-content">
                    <span class="info-label">DNI</span>
                    <span class="info-value">{{ cliente.dni || 'No especificado' }}</span>
                  </div>
                </div>

                <div class="info-item" *ngIf="cliente.telefono">
                  <mat-icon class="info-icon">phone</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Teléfono</span>
                    <span class="info-value">{{ cliente.telefono }}</span>
                  </div>
                </div>

                <div class="info-item" *ngIf="cliente.fechaNacimiento">
                  <mat-icon class="info-icon">cake</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Fecha de Nacimiento</span>
                    <span class="info-value">{{ formatearFecha(cliente.fechaNacimiento) }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <mat-icon class="info-icon">calendar_today</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Fecha de Registro</span>
                    <span class="info-value">{{ formatearFechaHora(cliente.fechaRegistro) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Tab: Fidelización -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>stars</mat-icon>
              Fidelización
            </ng-template>
            
            <div class="tab-content">
              <div class="fidelizacion-stats">
                <!-- Estadísticas principales -->
                <div class="stats-grid">
                  <div class="stat-card eventos">
                    <div class="stat-icon">
                      <mat-icon>event</mat-icon>
                    </div>
                    <div class="stat-content">
                      <div class="stat-number">{{ cliente.eventosAsistidos || 0 }}</div>
                      <div class="stat-label">Eventos Asistidos</div>
                    </div>
                  </div>

                  <div class="stat-card pases">
                    <div class="stat-icon">
                      <mat-icon>local_activity</mat-icon>
                    </div>
                    <div class="stat-content">
                      <div class="stat-number">{{ cliente.pasesGratuitos || 0 }}</div>
                      <div class="stat-label">Pases Disponibles</div>
                    </div>
                  </div>

                  <div class="stat-card reservas">
                    <div class="stat-icon">
                      <mat-icon>event_seat</mat-icon>
                    </div>
                    <div class="stat-content">
                      <div class="stat-number">{{ cliente.reservasActivas || 0 }}</div>
                      <div class="stat-label">Reservas Activas</div>
                    </div>
                  </div>
                </div>

                <!-- Progreso hacia próximo pase -->
                <div class="progreso-section">
                  <h3>
                    <mat-icon>gift</mat-icon>
                    Progreso hacia próximo pase gratuito
                  </h3>
                  <div class="progreso-contenido">
                    <div class="progreso-info">
                      <span>{{ getEventosRestantes() }} eventos restantes</span>
                      <span class="progreso-porcentaje">{{ getProgresoPorcentaje() }}%</span>
                    </div>
                    <mat-progress-bar 
                      mode="determinate" 
                      [value]="getProgresoPorcentaje()"
                      class="progreso-bar">
                    </mat-progress-bar>
                    <p class="progreso-descripcion">
                      Cada 5 eventos asistidos se otorga un pase gratuito
                    </p>
                  </div>
                </div>

                <!-- Nivel de cliente -->
                <div class="nivel-section">
                  <h3>
                    <mat-icon>workspace_premium</mat-icon>
                    Nivel de Cliente
                  </h3>
                  <div class="nivel-badge" [ngClass]="getNivelClase()">
                    <mat-icon>{{ getNivelIcono() }}</mat-icon>
                    <span>{{ getNivelTexto() }}</span>
                  </div>
                  <p class="nivel-descripcion">{{ getNivelDescripcion() }}</p>
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
        <button mat-raised-button color="primary" (click)="editarCliente()">
          <mat-icon>edit</mat-icon>
          Editar Cliente
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .cliente-detalles-container {
      width: 100%;
      max-width: 700px;
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

    .cliente-avatar-large {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .cliente-titulo {
      flex: 1;
    }

    .cliente-titulo h2 {
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

    .estado-chip, .frecuente-chip {
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

    .frecuente-chip {
      background: #fff3e0;
      color: #f57c00;
      border: 1px solid #ffe0b2;
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

    .detalles-tabs {
      height: 100%;
    }

    .tab-content {
      padding: 24px;
    }

    /* Información Personal */
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

    /* Fidelización */
    .fidelizacion-stats {
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

    .stat-card.eventos {
      border-left-color: #28a745;
    }

    .stat-card.pases {
      border-left-color: #ffc107;
    }

    .stat-card.reservas {
      border-left-color: #007bff;
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

    .stat-card.eventos .stat-icon {
      background: #e8f5e8;
      color: #28a745;
    }

    .stat-card.pases .stat-icon {
      background: #fff8e1;
      color: #ffc107;
    }

    .stat-card.reservas .stat-icon {
      background: #e3f2fd;
      color: #007bff;
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

    .progreso-section, .nivel-section {
      background: #f8f9fa;
      padding: 24px;
      border-radius: 12px;
      border-left: 4px solid #007bff;
    }

    .progreso-section h3, .nivel-section h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      color: #007bff;
      font-size: 1.1rem;
    }

    .progreso-contenido {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .progreso-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
    }

    .progreso-porcentaje {
      color: #007bff;
      font-weight: bold;
    }

    .progreso-bar {
      height: 8px;
      border-radius: 4px;
    }

    .progreso-descripcion {
      font-size: 0.9rem;
      color: #666;
      margin: 0;
      font-style: italic;
    }

    .nivel-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 1rem;
      margin-bottom: 12px;
    }

    .nivel-badge.nuevo {
      background: #e3f2fd;
      color: #1976d2;
    }

    .nivel-badge.bronce {
      background: #efebe9;
      color: #8d6e63;
    }

    .nivel-badge.plata {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .nivel-badge.oro {
      background: #fff8e1;
      color: #f57c00;
    }

    .nivel-descripcion {
      font-size: 0.9rem;
      color: #666;
      margin: 0;
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

    .actividad-placeholder h3 {
      color: #666;
      margin-bottom: 8px;
    }

    .actividad-placeholder p {
      margin-bottom: 24px;
      color: #999;
    }

    .dialog-actions {
      padding: 16px 24px;
      background: #fafafa;
      border-top: 1px solid #e0e0e0;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .cliente-detalles-container {
        max-width: 100%;
      }

      .header-section {
        padding: 16px;
      }

      .cliente-avatar-large {
        width: 60px;
        height: 60px;
        font-size: 1.5rem;
      }

      .cliente-titulo h2 {
        font-size: 1.4rem;
      }

      .tab-content {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .info-item {
        padding: 12px;
      }
    }
  `]
})
export class ClienteDetallesComponent {
  constructor(
    public dialogRef: MatDialogRef<ClienteDetallesComponent>,
    @Inject(MAT_DIALOG_DATA) public cliente: Cliente
  ) {}

  obtenerIniciales(nombre: string, apellido: string): string {
    return (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
  }

  formatearFechaHora(fecha: string | undefined): string {
  if (!fecha) return 'No especificada';
  
  // Para fechaRegistro que incluye hora, no necesitas ajuste
  const fechaObj = new Date(fecha);
  return fechaObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
} 

  formatearFecha(fecha: string | undefined): string {
  if (!fecha) return 'No especificada';
  
  const [year, month, day] = fecha.split('-');
  const fechaObj = new Date(Number(year), Number(month) - 1, Number(day));
  
  return fechaObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

  getEventosRestantes(): number {
    const eventos = this.cliente.eventosAsistidos || 0;
    return 5 - (eventos % 5);
  }

  getProgresoPorcentaje(): number {
    const eventos = this.cliente.eventosAsistidos || 0;
    return (eventos % 5) * 20;
  }

  getNivelTexto(): string {
    const eventos = this.cliente.eventosAsistidos || 0;
    if (eventos >= 20) return 'Oro';
    if (eventos >= 10) return 'Plata';
    if (eventos >= 5) return 'Bronce';
    return 'Nuevo';
  }

  getNivelClase(): string {
    return this.getNivelTexto().toLowerCase();
  }

  getNivelIcono(): string {
    const nivel = this.getNivelTexto();
    switch (nivel) {
      case 'Oro': return 'military_tech';
      case 'Plata': return 'workspace_premium';
      case 'Bronce': return 'grade';
      default: return 'star_border';
    }
  }

  getNivelDescripcion(): string {
    const eventos = this.cliente.eventosAsistidos || 0;
    if (eventos >= 20) return 'Cliente VIP con máximos beneficios';
    if (eventos >= 10) return 'Cliente premium con beneficios especiales';
    if (eventos >= 5) return 'Cliente frecuente con descuentos';
    return 'Cliente nuevo, ¡bienvenido!';
  }

  editarCliente(): void {
    this.dialogRef.close({ action: 'edit', cliente: this.cliente });
  }
}
