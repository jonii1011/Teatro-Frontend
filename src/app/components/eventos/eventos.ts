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
import { FormsModule } from '@angular/forms';

import { EventoService } from '../../services/evento';
import { Evento, TipoEvento } from '../../models/evento';
import { EventoFormComponent } from '../../components/eventos/evento-form/evento-form';
import { EventoDetallesComponent } from './evento-detalles/evento-detalles';

@Component({
  selector: 'app-eventos',
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
    MatTooltipModule
  ],
  template: `
    <div class="eventos-container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon class="title-icon">event</mat-icon>
          Gestión de Eventos
        </h1>
        <button mat-raised-button 
                color="primary" 
                (click)="abrirFormularioNuevo()"
                class="add-button">
          <mat-icon>add</mat-icon>
          Nuevo Evento
        </button>
      </div>

      <!-- Filtros y búsqueda -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar eventos</mat-label>
              <input matInput 
                     [(ngModel)]="filtroTexto"
                     (input)="aplicarFiltros()"
                     placeholder="Nombre del evento...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <div class="filter-chips">
              <div class="chip-group">
                <button class="filter-chip"
                        [class.selected]="filtroTipo === TipoEvento.OBRA_TEATRO"
                        (click)="toggleFiltroTipo(TipoEvento.OBRA_TEATRO)">
                  <mat-icon>theater_comedy</mat-icon>
                  Teatro
                </button>
                <button class="filter-chip"
                        [class.selected]="filtroTipo === TipoEvento.RECITAL"
                        (click)="toggleFiltroTipo(TipoEvento.RECITAL)">
                  <mat-icon>music_note</mat-icon>
                  Recital
                </button>
                <button class="filter-chip"
                        [class.selected]="filtroTipo === TipoEvento.CHARLA_CONFERENCIA"
                        (click)="toggleFiltroTipo(TipoEvento.CHARLA_CONFERENCIA)">
                  <mat-icon>school</mat-icon>
                  Conferencia
                </button>
                <button class="filter-chip"
                        [class.selected]="filtroVigentes === true"
                        (click)="toggleFiltroVigentes(true)">
                  <mat-icon>event_available</mat-icon>
                  Vigentes
                </button>
              </div>
            </div>

            <button mat-icon-button 
                    (click)="limpiarFiltros()"
                    matTooltip="Limpiar filtros">
              <mat-icon>clear</mat-icon>
            </button>
          </div>

          <div class="stats-summary">
            <span class="stat-item">
              <strong>{{ eventosFiltrados.length }}</strong> de {{ eventos.length }} eventos
            </span>
            <span class="stat-item">
              <strong>{{ contarEventosVigentes() }}</strong> vigentes
            </span>
            <span class="stat-item">
              <strong>{{ contarEventosHoy() }}</strong> hoy
            </span>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Tabla de eventos -->
      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-container" *ngIf="!loading; else loadingTemplate">
            <table mat-table [dataSource]="eventosFiltrados" class="eventos-table" matSort>
              
              <!-- Columna Tipo -->
              <ng-container matColumnDef="tipo">
                <th mat-header-cell *matHeaderCellDef>Tipo</th>
                <td mat-cell *matCellDef="let evento" class="tipo-cell">
                  <div class="evento-tipo">
                    <mat-icon class="tipo-icon">{{ getIconoTipoEvento(evento.tipoEvento) }}</mat-icon>
                  </div>
                </td>
              </ng-container>

              <!-- Columna Información del Evento -->
              <ng-container matColumnDef="info">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="nombre">Evento</th>
                <td mat-cell *matCellDef="let evento" class="info-cell">
                  <div class="evento-info">
                    <strong class="evento-nombre">{{ evento.nombre }}</strong>
                    <div class="evento-detalles">
                      <span class="evento-descripcion">{{ truncateText(evento.descripcion, 60) }}</span>
                      <span class="evento-tipo-texto">{{ getNombreTipoEvento(evento.tipoEvento) }}</span>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Columna Fecha y Hora -->
              <ng-container matColumnDef="fecha">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="fechaHora">Fecha y Hora</th>
                <td mat-cell *matCellDef="let evento" class="fecha-cell">
                  <div class="fecha-info">
                    <div class="fecha-date">
                      <mat-icon class="small-icon">calendar_today</mat-icon>
                      {{ formatDate(evento.fechaHora) }}
                    </div>
                    <div class="fecha-time">
                      <mat-icon class="small-icon">access_time</mat-icon>
                      {{ formatTime(evento.fechaHora) }}
                    </div>
                    <div class="fecha-relative" [class]="getClaseFechaRelativa(evento.fechaHora)">
                      {{ getFechaRelativa(evento.fechaHora) }}
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Columna Capacidad -->
              <ng-container matColumnDef="capacidad">
                <th mat-header-cell *matHeaderCellDef>Capacidad</th>
                <td mat-cell *matCellDef="let evento" class="capacidad-cell">
                  <div class="capacidad-info">
                    <div class="capacidad-numeros">
                      <span class="disponible">{{ getCapacidadDisponible(evento) }}</span>
                      <span class="separator">/</span>
                      <span class="total">{{ evento.capacidadTotal }}</span>
                    </div>
                    <div class="capacidad-barra">
                      <div class="barra-fondo">
                        <div class="barra-ocupada" 
                             [style.width.%]="getPorcentajeOcupado(evento)"></div>
                      </div>
                    </div>
                    <small class="ocupacion-texto">{{ getPorcentajeOcupado(evento) }}% ocupado</small>
                  </div>
                </td>
              </ng-container>

              <!-- Columna Estado -->
              <ng-container matColumnDef="estado">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let evento" class="estado-cell">
                  <div class="estado-badges">
                    <span class="estado-chip" 
                          [class.activo]="evento.activo !== false"
                          [class.inactivo]="evento.activo === false">
                      <mat-icon>{{ evento.activo !== false ? 'check_circle' : 'cancel' }}</mat-icon>
                      {{ evento.activo !== false ? 'Activo' : 'Inactivo' }}
                    </span>
                    <span *ngIf="evento.estaVigente" class="vigente-chip">
                      <mat-icon>event_available</mat-icon>
                      Vigente
                    </span>
                    <span *ngIf="isEventoLleno(evento)" class="lleno-chip">
                      <mat-icon>group</mat-icon>
                      Lleno
                    </span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let evento" class="acciones-cell">
                  <button mat-icon-button 
                          [matMenuTriggerFor]="menuAcciones"
                          class="menu-trigger"
                          (click)="$event.stopPropagation()">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  
                  <mat-menu #menuAcciones="matMenu">
                    <button mat-menu-item (click)="verDetalles(evento)">
                      <mat-icon>visibility</mat-icon>
                      <span>Ver detalles</span>
                    </button>
                    <button mat-menu-item (click)="editarEvento(evento)">
                      <mat-icon>edit</mat-icon>
                      <span>Editar</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item 
                            (click)="eliminarEvento(evento)"
                            class="danger">
                      <mat-icon>delete</mat-icon>
                      <span>Eliminar</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columnasVisibles"></tr>
              <tr mat-row *matRowDef="let row; columns: columnasVisibles;" 
                  class="evento-row"
                  [class.evento-pasado]="isEventoPasado(row)"
                  [class.evento-hoy]="isEventoHoy(row)"
                  (click)="verDetalles(row)"></tr>
            </table>

            <!-- Estado vacío -->
            <div *ngIf="eventosFiltrados.length === 0" class="empty-state">
              <mat-icon class="empty-icon">event_note</mat-icon>
              <h3>{{ eventos.length === 0 ? 'No hay eventos creados' : 'No se encontraron eventos' }}</h3>
              <p>{{ eventos.length === 0 ? 'Comienza creando tu primer evento' : 'Prueba ajustando los filtros de búsqueda' }}</p>
              <button mat-raised-button 
                      color="primary" 
                      (click)="abrirFormularioNuevo()"
                      *ngIf="eventos.length === 0">
                <mat-icon>add</mat-icon>
                Crear Evento
              </button>
            </div>
          </div>

          <!-- Template de carga -->
          <ng-template #loadingTemplate>
            <div class="loading-container">
              <mat-spinner diameter="50"></mat-spinner>
              <p>Cargando eventos...</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .eventos-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 32px 24px;
      background: #fafafa;
      min-height: 100vh;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      color: #212121;
      font-size: 2rem;
      font-weight: 300;
    }

    .title-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: #666;
    }

    .add-button {
      background: #000;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 24px;
      font-weight: 500;
      transition: all 0.2s ease;
      text-transform: none;
    }

    .add-button:hover {
      background: #333;
      transform: translateY(-1px);
    }

    .filters-card {
      margin-bottom: 32px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      border: 1px solid #f0f0f0;
    }

    .filters-row {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      max-width: 400px;
      min-width: 280px;
    }

    .filter-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .chip-group {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: 1px solid #e0e0e0;
      border-radius: 20px;
      background: white;
      color: #666;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.9rem;
      font-weight: 400;
    }

    .filter-chip:hover {
      border-color: #000;
      color: #000;
    }

    .filter-chip.selected {
      background: #000;
      color: white;
      border-color: #000;
    }

    .stats-summary {
      display: flex;
      gap: 32px;
      color: #666;
      font-size: 0.9rem;
      flex-wrap: wrap;
    }

    .stat-item strong {
      color: #000;
      font-weight: 500;
    }

    .table-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      border: 1px solid #f0f0f0;
      overflow: hidden;
    }

    .table-container {
      overflow-x: auto;
    }

    .eventos-table {
      width: 100%;
      background: transparent;
    }

    .mat-mdc-header-row {
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }

    .mat-mdc-header-cell {
      color: #666;
      font-weight: 500;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: none;
      padding: 20px 16px;
    }

    .evento-row {
      cursor: pointer;
      transition: background-color 0.2s ease;
      border-bottom: 1px solid #f5f5f5;
    }

    .evento-row:hover {
      background: #f9f9f9;
    }

    .evento-row.evento-hoy {
      background: #e8f5e8;
    }

    .evento-row.evento-pasado {
      opacity: 0.6;
    }

    .mat-mdc-cell {
      border-bottom: none;
      padding: 20px 16px;
      color: #333;
    }

    .tipo-cell {
      width: 60px;
    }

    .evento-tipo {
      display: flex;
      justify-content: center;
    }

    .tipo-icon {
      width: 32px;
      height: 32px;
      font-size: 32px;
      color: #666;
    }

    .info-cell {
      min-width: 280px;
    }

    .evento-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .evento-nombre {
      font-size: 1rem;
      color: #212121;
      font-weight: 500;
    }

    .evento-detalles {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .evento-descripcion {
      color: #666;
      font-size: 0.9rem;
    }

    .evento-tipo-texto {
      color: #999;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .fecha-cell {
      min-width: 180px;
    }

    .fecha-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .fecha-date,
    .fecha-time {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9rem;
      color: #666;
    }

    .fecha-relative {
      font-size: 0.8rem;
      padding: 2px 6px;
      border-radius: 8px;
      text-align: center;
      font-weight: 500;
    }

    .fecha-relative.hoy {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .fecha-relative.proximo {
      background: #fff3e0;
      color: #f57c00;
    }

    .fecha-relative.pasado {
      background: #ffebee;
      color: #c62828;
    }

    .small-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #999;
    }

    .capacidad-cell {
      min-width: 140px;
    }

    .capacidad-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .capacidad-numeros {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .disponible {
      color: #2e7d32;
      font-weight: 500;
    }

    .separator {
      color: #999;
    }

    .total {
      color: #666;
    }

    .capacidad-barra {
      width: 100%;
    }

    .barra-fondo {
      width: 100%;
      height: 6px;
      background: #f0f0f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .barra-ocupada {
      height: 100%;
      background: linear-gradient(90deg, #4caf50, #2e7d32);
      transition: width 0.3s ease;
    }

    .ocupacion-texto {
      color: #999;
      font-size: 0.75rem;
      text-align: center;
    }

    .estado-cell {
      min-width: 140px;
    }

    .estado-badges {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .estado-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      height: 24px;
      padding: 4px 8px;
      border-radius: 12px;
      width: fit-content;
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
      display: flex;
      align-items: center;
      gap: 4px;
      background: #e3f2fd;
      color: #1976d2;
      font-size: 0.75rem;
      height: 24px;
      padding: 4px 8px;
      border-radius: 12px;
      width: fit-content;
      font-weight: 500;
      border: 1px solid #bbdefb;
    }

    .lleno-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      background: #fff3e0;
      color: #f57c00;
      font-size: 0.75rem;
      height: 24px;
      padding: 4px 8px;
      border-radius: 12px;
      width: fit-content;
      font-weight: 500;
      border: 1px solid #ffe0b2;
    }

    .acciones-cell {
      width: 50px;
    }

    .menu-trigger {
      color: #666;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .menu-trigger:hover {
      background: #f5f5f5;
      color: #000;
    }

    .danger {
      color: #d32f2f !important;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: #999;
    }

    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      opacity: 0.3;
      margin-bottom: 20px;
      color: #ccc;
    }

    .empty-state h3 {
      color: #666;
      font-weight: 400;
      margin-bottom: 8px;
    }

    .empty-state p {
      font-size: 1rem;
      margin-bottom: 24px;
      color: #999;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      color: #666;
    }

    .loading-container .mat-mdc-progress-spinner {
      margin-bottom: 20px;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .eventos-container {
        padding: 24px 16px;
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
        text-align: center;
      }

      .filters-row {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .search-field {
        max-width: none;
        min-width: unset;
      }

      .filter-chips {
        justify-content: center;
      }

      .stats-summary {
        flex-direction: column;
        gap: 8px;
        text-align: center;
      }

      .info-cell {
        min-width: 200px;
      }

      .fecha-cell {
        min-width: 120px;
      }

      .capacidad-cell {
        min-width: 100px;
      }
    }

    @media (max-width: 480px) {
      .eventos-container {
        padding: 16px;
      }

      .page-title {
        font-size: 1.5rem;
      }
      
      .title-icon {
        font-size: 1.5rem;
        width: 1.5rem;
        height: 1.5rem;
      }
      
      .filter-chip {
        padding: 6px 12px;
        font-size: 0.8rem;
      }

      .mat-mdc-header-cell,
      .mat-mdc-cell {
        padding: 12px 8px;
      }
    }
  `]
})
export class EventosComponent implements OnInit {
  eventos: Evento[] = [];
  eventosFiltrados: Evento[] = [];
  loading = true;
  
  // Filtros
  filtroTexto = '';
  filtroTipo: TipoEvento | null = null;
  filtroVigentes: boolean | null = null;

  // Hacer TipoEvento accesible en el template
  TipoEvento = TipoEvento;

  columnasVisibles = ['tipo', 'info', 'fecha', 'capacidad', 'estado', 'acciones'];

  // Mapeos para UI
  tiposEventoNombres = {
    [TipoEvento.OBRA_TEATRO]: 'Teatro',
    [TipoEvento.RECITAL]: 'Recital',
    [TipoEvento.CHARLA_CONFERENCIA]: 'Conferencia'
  };

  tiposEventoIconos = {
    [TipoEvento.OBRA_TEATRO]: 'theater_comedy',
    [TipoEvento.RECITAL]: 'music_note',
    [TipoEvento.CHARLA_CONFERENCIA]: 'school'
  };

  constructor(
    private eventoService: EventoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos(): void {
    this.loading = true;
    this.eventoService.obtenerTodosLosEventos().subscribe({
      next: (eventos) => {
        this.eventos = eventos;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando eventos:', error);
        this.snackBar.open('Error al cargar los eventos', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
    let filtrados = [...this.eventos];

    // Filtro por texto
    if (this.filtroTexto.trim()) {
      const texto = this.filtroTexto.toLowerCase();
      filtrados = filtrados.filter(evento =>
        evento.nombre.toLowerCase().includes(texto) ||
        evento.descripcion.toLowerCase().includes(texto)
      );
    }

    // Filtro por tipo
    if (this.filtroTipo !== null) {
      filtrados = filtrados.filter(evento => evento.tipoEvento === this.filtroTipo);
    }

    // Filtro por vigentes
    if (this.filtroVigentes !== null) {
      filtrados = filtrados.filter(evento =>
        this.filtroVigentes ? evento.estaVigente === true : evento.estaVigente !== true
      );
    }

    this.eventosFiltrados = filtrados;
  }

  toggleFiltroTipo(tipo: TipoEvento): void {
    this.filtroTipo = this.filtroTipo === tipo ? null : tipo;
    this.aplicarFiltros();
  }

  toggleFiltroVigentes(valor: boolean): void {
    this.filtroVigentes = this.filtroVigentes === valor ? null : valor;
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroTipo = null;
    this.filtroVigentes = null;
    this.aplicarFiltros();
  }

  abrirFormularioNuevo(): void {
    const dialogRef = this.dialog.open(EventoFormComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarEventos();
        this.snackBar.open('Evento creado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  editarEvento(evento: Evento): void {
    const dialogRef = this.dialog.open(EventoFormComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: { isEdit: true, evento: evento }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarEventos();
        this.snackBar.open('Evento actualizado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  eliminarEvento(evento: Evento): void {
  const mensaje = `¿Está seguro que desea eliminar el evento "${evento.nombre}"?`;
  
  if (confirm(mensaje)) {
    this.eventoService.eliminarEvento(evento.id!).subscribe({
      next: () => {
        // Quitar el evento de la lista local
        this.eventos = this.eventos.filter(e => e.id !== evento.id);
        this.aplicarFiltros(); // Si tienes filtros
        
        this.snackBar.open('Evento eliminado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error al eliminar evento:', error);
        
        let mensaje = 'Error al eliminar el evento';
        if (error.status === 400) {
          mensaje = 'No se puede eliminar el evento (tiene reservas activas)';
        }
        
        this.snackBar.open(mensaje, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}

  verDetalles(evento: Evento): void {
    this.dialog.open(EventoDetallesComponent, {
    data: evento,
    width: '90vw',
    maxWidth: '800px',
    height: 'auto'
  });
  }

  toggleActivoEvento(evento: Evento): void {
    // TODO: Implementar activar/desactivar evento
    console.log('Toggle activo:', evento);
  }

  // Métodos de utilidad para formateo
  formatDate(fechaHora: string): string {
    const date = new Date(fechaHora);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
  }

  formatTime(fechaHora: string): string {
    const date = new Date(fechaHora);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFechaRelativa(fechaHora: string): string {
    const fecha = new Date(fechaHora);
    const hoy = new Date();
    const diffDays = Math.floor((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays === -1) return 'Ayer';
    if (diffDays < 0) return `Hace ${Math.abs(diffDays)} días`;
    if (diffDays <= 7) return `En ${diffDays} días`;
    return '';
  }

  getClaseFechaRelativa(fechaHora: string): string {
    const fecha = new Date(fechaHora);
    const hoy = new Date();
    const diffDays = Math.floor((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'hoy';
    if (diffDays > 0 && diffDays <= 7) return 'proximo';
    if (diffDays < 0) return 'pasado';
    return '';
  }

  truncateText(text: string, length: number): string {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  getNombreTipoEvento(tipo: TipoEvento): string {
    return this.tiposEventoNombres[tipo];
  }

  getIconoTipoEvento(tipo: TipoEvento): string {
    return this.tiposEventoIconos[tipo];
  }

  getCapacidadDisponible(evento: Evento): number {
    const ocupadas = evento.totalReservasActivas || 0;
    return evento.capacidadTotal - ocupadas;
  }

  getPorcentajeOcupado(evento: Evento): number {
    const ocupadas = evento.totalReservasActivas || 0;
    return Math.round((ocupadas / evento.capacidadTotal) * 100);
  }

  isEventoLleno(evento: Evento): boolean {
    return this.getCapacidadDisponible(evento) <= 0;
  }

  isEventoPasado(evento: Evento): boolean {
    return new Date(evento.fechaHora) < new Date();
  }

  isEventoHoy(evento: Evento): boolean {
    const fecha = new Date(evento.fechaHora);
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  }

  // Métodos de conteo para estadísticas
  contarEventosVigentes(): number {
    return this.eventos.filter(e => e.estaVigente === true).length;
  }

  contarEventosHoy(): number {
    return this.eventos.filter(e => this.isEventoHoy(e)).length;
  }
}