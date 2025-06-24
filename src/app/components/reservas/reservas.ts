import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ReservaService } from '../../services/reserva';
import { ClienteService } from '../../services/cliente';
import { EventoService } from '../../services/evento';
import { Reserva, EstadoReserva } from '../../models/reserva';
import { TipoEntrada } from '../../models/evento';
import { ReservaDetallesComponent } from './reserva-detalles/reserva-detalles';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDividerModule,
    MatTooltipModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="reservas-container">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon class="title-icon">event_note</mat-icon>
          Gestión de Reservas
        </h1>
        <button mat-raised-button color="primary" (click)="crearNuevaReserva()" class="add-button">
          <mat-icon>add</mat-icon>
          Nueva Reserva
        </button>
      </div>

      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar reservas</mat-label>
              <input matInput [(ngModel)]="filtroTexto" (input)="aplicarFiltros()" placeholder="Código, cliente, evento...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-select">
              <mat-label>Estado</mat-label>
              <mat-select [(ngModel)]="filtroEstado" (selectionChange)="aplicarFiltros()">
                <mat-option [value]="null">Todos</mat-option>
                <mat-option [value]="EstadoReserva.CONFIRMADA">Confirmadas</mat-option>
                <mat-option [value]="EstadoReserva.CANCELADA">Canceladas</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="filter-chips">
              <button class="filter-chip" [class.selected]="soloHoy" (click)="toggleFiltroHoy()">
                <mat-icon>today</mat-icon>
                Hoy
              </button>
              <button class="filter-chip" [class.selected]="soloPasesGratuitos" (click)="toggleFiltroPasesGratuitos()">
                <mat-icon>card_giftcard</mat-icon>
                Pases Gratuitos
              </button>
            </div>

            <button mat-icon-button (click)="limpiarFiltros()" matTooltip="Limpiar filtros">
              <mat-icon>clear</mat-icon>
            </button>
          </div>

          <div class="stats-summary">
            <span class="stat-item">
              <strong>{{ reservasFiltradas.length }}</strong> de {{ reservas.length }} reservas
            </span>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-container" *ngIf="!loading; else loadingTemplate">
            <table mat-table [dataSource]="reservasFiltradas" class="reservas-table">
              
              <ng-container matColumnDef="codigo">
                <th mat-header-cell *matHeaderCellDef>Código</th>
                <td mat-cell *matCellDef="let reserva">
                  <strong>{{ reserva.codigoReserva }}</strong>
                </td>
              </ng-container>

              <ng-container matColumnDef="cliente">
                <th mat-header-cell *matHeaderCellDef>Cliente</th>
                <td mat-cell *matCellDef="let reserva">
                  <div>
                    <strong>{{ reserva.cliente.nombre }} {{ reserva.cliente.apellido }}</strong>
                    <div>{{ reserva.cliente.email }}</div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="evento">
                <th mat-header-cell *matHeaderCellDef>Evento</th>
                <td mat-cell *matCellDef="let reserva">
                  <div>
                    <strong>{{ reserva.evento.nombre }}</strong>
                    <div>{{ formatDate(reserva.evento.fechaHora) }}</div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="entrada">
                <th mat-header-cell *matHeaderCellDef>Entrada</th>
                <td mat-cell *matCellDef="let reserva">
                  <div>
                    <span>{{ getNombreTipoEntrada(reserva.tipoEntrada) }}</span>
                    <div *ngIf="!reserva.esPaseGratuito">
                      <span>{{ '$' + obtenerPrecio(reserva) }}</span>
                    </div>
                    <div *ngIf="reserva.esPaseGratuito">
                      <span>Pase Gratuito</span>
                    </div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="estado">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let reserva">
                  <span class="estado-badge" [ngClass]="'estado-' + reserva.estado.toLowerCase()">
                    {{ getNombreEstado(reserva.estado) }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let reserva" (click)="$event.stopPropagation()">
                  <button mat-icon-button 
                          [matMenuTriggerFor]="menuAcciones"
                          class="menu-trigger">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  
                  <mat-menu #menuAcciones="matMenu">
                    <button mat-menu-item (click)="verDetalles(reserva)">
                      <mat-icon>visibility</mat-icon>
                      <span>Ver detalles</span>
                    </button>
                    
                    <button mat-menu-item 
                            (click)="cancelarReservaDirecta(reserva)"
                            *ngIf="puedeCancelarReserva(reserva)"
                            class="danger">
                      <mat-icon>cancel</mat-icon>
                      <span>Cancelar reserva</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columnasVisibles"></tr>
              <tr mat-row *matRowDef="let row; columns: columnasVisibles;" 
                  class="reserva-row"
                  [class.reserva-cancelada]="row.estado === EstadoReserva.CANCELADA"
                  [class.reserva-confirmada]="row.estado === EstadoReserva.CONFIRMADA"
                  (click)="verDetalles(row)"></tr>
            </table>

            <div *ngIf="reservasFiltradas.length === 0" class="empty-state">
              <mat-icon class="empty-icon">event_note</mat-icon>
              <h3>{{ reservas.length === 0 ? 'No hay reservas creadas' : 'No se encontraron reservas' }}</h3>
              <p>{{ reservas.length === 0 ? 'Comienza creando tu primera reserva' : 'Prueba ajustando los filtros de búsqueda' }}</p>
              <button mat-raised-button 
                      color="primary" 
                      (click)="crearNuevaReserva()"
                      *ngIf="reservas.length === 0">
                <mat-icon>add</mat-icon>
                Crear Reserva
              </button>
            </div>
          </div>

          <ng-template #loadingTemplate>
            <div class="loading-container">
              <mat-spinner diameter="50"></mat-spinner>
              <p>Cargando reservas...</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .reservas-container { 
      max-width: 1200px; 
      margin: 0 auto; 
      padding: 24px; 
    }
    
    .page-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 24px; 
    }
    
    .page-title { 
      display: flex; 
      align-items: center; 
      gap: 8px; 
      margin: 0; 
      color: #333;
      font-size: 1.8rem;
    }
    
    .title-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }
    
    .filters-card, .table-card { 
      margin-bottom: 24px; 
    }
    
    .filters-row { 
      display: flex; 
      gap: 16px; 
      align-items: center; 
      flex-wrap: wrap; 
    }
    
    .search-field { 
      flex: 1; 
      max-width: 300px; 
    }
    
    .filter-select {
      min-width: 120px;
    }
    
    .filter-chips { 
      display: flex; 
      gap: 8px; 
    }
    
    .filter-chip { 
      padding: 8px 16px; 
      border: 1px solid #ddd; 
      border-radius: 20px; 
      background: white; 
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }
    
    .filter-chip:hover {
      border-color: #007bff;
    }
    
    .filter-chip.selected { 
      background: #007bff; 
      color: white;
      border-color: #007bff;
    }
    
    .stats-summary { 
      margin-top: 16px;
      color: #666;
    }
    
    .stat-item {
      font-size: 0.9rem;
    }
    
    .table-container { 
      overflow-x: auto; 
    }
    
    .reservas-table {
      width: 100%;
    }
    
    .empty-state, .loading-container { 
      text-align: center; 
      padding: 40px;
      color: #666;
    }
    
    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
      margin-bottom: 16px;
    }
    
    mat-cell, mat-header-cell { 
      padding: 16px 8px; 
    }

    /* Estilos para el menú */
    .menu-trigger {
      transition: all 0.2s ease;
    }

    .menu-trigger:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }

    /* Estilos para items del menú peligrosos */
    ::ng-deep .mat-mdc-menu-panel .danger {
      color: #d32f2f !important;
    }

    ::ng-deep .mat-mdc-menu-panel .danger mat-icon {
      color: #d32f2f !important;
    }

    ::ng-deep .mat-mdc-menu-panel .danger:hover {
      background-color: rgba(211, 47, 47, 0.1) !important;
    }

    /* Estilos para las filas según estado */
    .reserva-row {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .reserva-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .reserva-row.reserva-cancelada {
      opacity: 0.7;
      background-color: rgba(244, 67, 54, 0.05);
    }

    .reserva-row.reserva-confirmada {
      background-color: rgba(76, 175, 80, 0.05);
    }

    /* Badges de estado */
    .estado-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .estado-badge.estado-confirmada {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .estado-badge.estado-cancelada {
      background-color: #ffebee;
      color: #c62828;
    }

    /* Estilos para snackbars */
    ::ng-deep .success-snackbar {
      background-color: #4caf50 !important;
      color: white !important;
    }

    ::ng-deep .error-snackbar {
      background-color: #f44336 !important;
      color: white !important;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .reservas-container {
        padding: 16px;
      }
      
      .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }
      
      .search-field, .filter-select {
        max-width: none;
      }
      
      .filter-chips {
        justify-content: center;
      }
      
      .menu-trigger {
        padding: 8px;
      }
      
      ::ng-deep .mat-mdc-menu-panel {
        min-width: 200px;
      }
    }
  `]
})
export class ReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  reservasFiltradas: Reserva[] = [];
  loading = true;
  
  filtroTexto = '';
  filtroEstado: EstadoReserva | null = null;
  soloHoy = false;
  soloPasesGratuitos = false;

  EstadoReserva = EstadoReserva;
  TipoEntrada = TipoEntrada;

  columnasVisibles = ['codigo', 'cliente', 'evento', 'entrada', 'estado', 'acciones'];

  estadosNombres = {
    [EstadoReserva.CONFIRMADA]: 'Confirmada',
    [EstadoReserva.CANCELADA]: 'Cancelada'
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

  constructor(
    private reservaService: ReservaService,
    private clienteService: ClienteService,
    private eventoService: EventoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.loading = true;
    this.reservaService.obtenerTodasLasReservas().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar reservas:', error);
        this.snackBar.open('Error al cargar las reservas', 'Cerrar', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
    let filtradas = [...this.reservas];

    if (this.filtroTexto.trim()) {
      const texto = this.filtroTexto.toLowerCase();
      filtradas = filtradas.filter(reserva =>
        reserva.codigoReserva?.toLowerCase().includes(texto) ||
        reserva.cliente.nombre.toLowerCase().includes(texto) ||
        reserva.cliente.apellido.toLowerCase().includes(texto) ||
        reserva.cliente.email.toLowerCase().includes(texto) ||
        reserva.evento.nombre.toLowerCase().includes(texto)
      );
    }

    if (this.filtroEstado !== null) {
      filtradas = filtradas.filter(reserva => reserva.estado === this.filtroEstado);
    }

    if (this.soloHoy) {
      filtradas = filtradas.filter(reserva => this.isEventoHoy(reserva.evento.fechaHora));
    }

    if (this.soloPasesGratuitos) {
      filtradas = filtradas.filter(reserva => reserva.esPaseGratuito);
    }

    this.reservasFiltradas = filtradas;
  }

  toggleFiltroHoy(): void {
    this.soloHoy = !this.soloHoy;
    this.aplicarFiltros();
  }

  toggleFiltroPasesGratuitos(): void {
    this.soloPasesGratuitos = !this.soloPasesGratuitos;
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroEstado = null;
    this.soloHoy = false;
    this.soloPasesGratuitos = false;
    this.aplicarFiltros();
  }

  crearNuevaReserva(): void {
    this.router.navigate(['/reservas/crear']);
  }

  verDetalles(reserva: Reserva): void {
    const dialogRef = this.dialog.open(ReservaDetallesComponent, {
      data: reserva,
      width: '90vw',
      maxWidth: '700px',
      height: 'auto',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'nueva-reserva') {
        // Navegar a crear nueva reserva con el cliente preseleccionado
        this.router.navigate(['/reservas/crear'], { 
          queryParams: { clienteId: result.clienteId } 
        });
      }
      // Recargar las reservas para obtener los datos actualizados
      this.cargarReservas();
    });
  }

  // Métodos de validación para el menú
  puedeCancelarReserva(reserva: Reserva): boolean {
    return reserva.estado === EstadoReserva.CONFIRMADA && 
           new Date(reserva.evento.fechaHora) > new Date();
  }

  // Métodos de acción directa desde el menú
  cancelarReservaDirecta(reserva: Reserva): void {
    const motivo = prompt('Ingrese el motivo de cancelación:');
    if (motivo && reserva.id) {
      this.reservaService.cancelarReserva(reserva.id, motivo).subscribe({
        next: (reservaActualizada) => {
          this.snackBar.open('Reserva cancelada exitosamente', 'Cerrar', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.cargarReservas(); // Recargar la lista
        },
        error: (error) => {
          console.error('Error al cancelar reserva:', error);
          this.snackBar.open('Error al cancelar la reserva', 'Cerrar', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  formatDate(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  getNombreEstado(estado: EstadoReserva): string {
    return this.estadosNombres[estado];
  }

  getNombreTipoEntrada(tipo: TipoEntrada): string {
    return this.tiposEntradaNombres[tipo];
  }

  obtenerPrecio(reserva: Reserva): number {
    return reserva.precioPagado || 0;
  }

  isEventoHoy(fechaHora: string): boolean {
    const fecha = new Date(fechaHora);
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  }
}