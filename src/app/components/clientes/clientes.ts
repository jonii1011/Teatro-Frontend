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

import { ClienteService } from '../../services/cliente';
import { Cliente } from '../../models/cliente';
import { ClienteFormComponent } from '../../components/clientes/cliente-form/cliente-form';
import { ClienteDetallesComponent } from './cliente-detalles/cliente-detalles';

@Component({
  selector: 'app-clientes',
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
    <div class="clientes-container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon class="title-icon">people</mat-icon>
          Gestión de Clientes
        </h1>
        <button mat-raised-button 
                color="primary" 
                (click)="abrirFormularioNuevo()"
                class="add-button">
          <mat-icon>person_add</mat-icon>
          Nuevo Cliente
        </button>
      </div>

      <!-- Filtros y búsqueda -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar clientes</mat-label>
              <input matInput 
                     [(ngModel)]="filtroTexto"
                     (input)="aplicarFiltros()"
                     placeholder="Nombre, apellido o email...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <div class="filter-chips">
              <div class="chip-group">
                <button mat-chip-option
                        [selected]="filtroActivos === true"
                        (click)="toggleFiltroActivos(true)"
                        class="filter-chip">
                  <mat-icon>check_circle</mat-icon>
                  Solo Activos
                </button>
                <button mat-chip-option
                        [selected]="filtroFrecuentes === true"
                        (click)="toggleFiltroFrecuentes(true)"
                        class="filter-chip">
                  <mat-icon>star</mat-icon>
                  Frecuentes
                </button>
                <button mat-chip-option
                        [selected]="filtroConPases === true"
                        (click)="toggleFiltroConPases(true)"
                        class="filter-chip">
                  <mat-icon>local_activity</mat-icon>
                  Con Pases
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
              <strong>{{ clientesFiltrados.length }}</strong> de {{ clientes.length }} clientes
            </span>
            <span class="stat-item">
              <strong>{{ contarClientesFrecuentes() }}</strong> frecuentes
            </span>
            <span class="stat-item">
              <strong>{{ contarClientesConPases() }}</strong> con pases disponibles
            </span>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Tabla de clientes -->
      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-container" *ngIf="!loading; else loadingTemplate">
            <table mat-table [dataSource]="clientesFiltrados" class="clientes-table" matSort>
              
              <!-- Columna Avatar/Inicial -->
              <ng-container matColumnDef="avatar">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let cliente" class="avatar-cell">
                  <div class="cliente-avatar">
                    {{ obtenerIniciales(cliente.nombre, cliente.apellido) }}
                  </div>
                </td>
              </ng-container>

              <!-- Columna Información Personal -->
              <ng-container matColumnDef="info">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="nombre">Cliente</th>
                <td mat-cell *matCellDef="let cliente" class="info-cell">
                  <div class="cliente-info">
                    <strong class="cliente-nombre">{{ cliente.nombre }} {{ cliente.apellido }}</strong>
                    <div class="cliente-detalles">
                      <span class="email">{{ cliente.email }}</span>
                      <span class="dni" *ngIf="cliente.dni">DNI: {{ cliente.dni }}</span>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Columna Contacto -->
              <ng-container matColumnDef="contacto">
                <th mat-header-cell *matHeaderCellDef>Contacto</th>
                <td mat-cell *matCellDef="let cliente" class="contacto-cell">
                  <div class="contacto-info">
                    <span *ngIf="cliente.telefono" class="telefono">
                      <mat-icon class="small-icon">phone</mat-icon>
                      {{ cliente.telefono }}
                    </span>
                    <span *ngIf="cliente.direccion" class="direccion">
                      <mat-icon class="small-icon">location_on</mat-icon>
                      {{ cliente.direccion }}
                    </span>
                  </div>
                </td>
              </ng-container>

              <!-- Columna Estadísticas -->
              <ng-container matColumnDef="stats">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="eventosAsistidos">Estadísticas</th>
                <td mat-cell *matCellDef="let cliente" class="stats-cell">
                  <div class="cliente-stats">
                    <div class="stat-badge eventos">
                      <mat-icon>event</mat-icon>
                      <span>{{ cliente.eventosAsistidos || 0 }} eventos</span>
                    </div>
                    <div class="stat-badge pases" *ngIf="cliente.pasesGratuitos && cliente.pasesGratuitos > 0">
                      <mat-icon>local_activity</mat-icon>
                      <span>{{ cliente.pasesGratuitos }} pases</span>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Columna Estado -->
              <ng-container matColumnDef="estado">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let cliente" class="estado-cell">
                  <div class="estado-badges">
                    <mat-chip class="estado-chip" 
                             [class.activo]="cliente.activo !== false"
                             [class.inactivo]="cliente.activo === false">
                      <mat-icon>{{ cliente.activo !== false ? 'check_circle' : 'cancel' }}</mat-icon>
                      {{ cliente.activo !== false ? 'Activo' : 'Inactivo' }}
                    </mat-chip>
                    <mat-chip *ngIf="cliente.esClienteFrecuente" class="frecuente-chip">
                      <mat-icon>star</mat-icon>
                      Frecuente
                    </mat-chip>
                  </div>
                </td>
              </ng-container>

              <!-- Columna Acciones -->
              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let cliente" class="acciones-cell">
                  <button mat-icon-button 
                          [matMenuTriggerFor]="menuAcciones"
                          class="menu-trigger">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  
                  <mat-menu #menuAcciones="matMenu">
                    <button mat-menu-item (click)="verDetalles(cliente)">
                      <mat-icon>visibility</mat-icon>
                      <span>Ver detalles</span>
                    </button>
                    <button mat-menu-item (click)="editarCliente(cliente)">
                      <mat-icon>edit</mat-icon>
                      <span>Editar</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item 
                            (click)="toggleActivoCliente(cliente)"
                            [class.danger]="cliente.activo !== false">
                      <mat-icon>{{ cliente.activo !== false ? 'block' : 'check_circle' }}</mat-icon>
                      <span>{{ cliente.activo !== false ? 'Desactivar' : 'Activar' }}</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columnasVisibles"></tr>
              <tr mat-row *matRowDef="let row; columns: columnasVisibles;" 
              class="cliente-row"></tr>
            </table>

            <!-- Estado vacío -->
            <div *ngIf="clientesFiltrados.length === 0" class="empty-state">
              <mat-icon class="empty-icon">people_outline</mat-icon>
              <h3>{{ clientes.length === 0 ? 'No hay clientes registrados' : 'No se encontraron clientes' }}</h3>
              <p>{{ clientes.length === 0 ? 'Comienza agregando tu primer cliente' : 'Prueba ajustando los filtros de búsqueda' }}</p>
              <button mat-raised-button 
                      color="primary" 
                      (click)="abrirFormularioNuevo()"
                      *ngIf="clientes.length === 0">
                <mat-icon>person_add</mat-icon>
                Agregar Cliente
              </button>
            </div>
          </div>

          <!-- Template de carga -->
          <ng-template #loadingTemplate>
            <div class="loading-container">
              <mat-spinner diameter="50"></mat-spinner>
              <p>Cargando clientes...</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .clientes-container {
      max-width: 1200px;
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

    .filter-chip[selected] {
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

    .clientes-table {
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

    .cliente-row {
      transition: background-color 0.2s ease;
      border-bottom: 1px solid #f5f5f5;
    }

    .cliente-row:hover {
      background: #f9f9f9;
    }

    .mat-mdc-cell {
      border-bottom: none;
      padding: 20px 16px;
      color: #333;
    }

    .avatar-cell {
      width: 60px;
    }

    .cliente-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #f0f0f0;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-size: 14px;
      border: 1px solid #e0e0e0;
    }

    .info-cell {
      min-width: 250px;
    }

    .cliente-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .cliente-nombre {
      font-size: 1rem;
      color: #212121;
      font-weight: 500;
    }

    .cliente-detalles {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .email {
      color: #666;
      font-size: 0.9rem;
    }

    .dni {
      color: #999;
      font-size: 0.85rem;
    }

    .contacto-cell {
      min-width: 200px;
    }

    .contacto-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .telefono, .direccion {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9rem;
      color: #666;
    }

    .small-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #999;
    }

    .stats-cell {
      min-width: 150px;
    }

    .cliente-stats {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem;
      padding: 4px 8px;
      border-radius: 12px;
      width: fit-content;
      color: #666;
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
    }

    .stat-badge mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .estado-cell {
      min-width: 120px;
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

    .frecuente-chip {
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

    /* Form field customization */
    .search-field .mat-mdc-form-field-wrapper {
      background: transparent;
    }

    .search-field .mdc-notched-outline__leading,
    .search-field .mdc-notched-outline__notch,
    .search-field .mdc-notched-outline__trailing {
      border-color: #e0e0e0;
    }

    .search-field:hover .mdc-notched-outline__leading,
    .search-field:hover .mdc-notched-outline__notch,
    .search-field:hover .mdc-notched-outline__trailing {
      border-color: #000;
    }

    /* Menu styles */
    .mat-mdc-menu-panel {
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      border: 1px solid #f0f0f0;
    }

    .mat-mdc-menu-item {
      color: #666;
      font-size: 0.9rem;
    }

    .mat-mdc-menu-item:hover {
      background: #f9f9f9;
      color: #000;
    }

    /* Snackbar styles */
    .success-snackbar {
      background: #4caf50 !important;
      color: white !important;
    }

    .error-snackbar {
      background: #f44336 !important;
      color: white !important;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .clientes-container {
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
        min-width: 180px;
      }

      .contacto-cell {
        min-width: 140px;
      }

      .stats-cell {
        min-width: 100px;
      }
    }

    @media (max-width: 480px) {
      .clientes-container {
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
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  loading = true;
  
  // Filtros
  filtroTexto = '';
  filtroActivos: boolean | null = null;
  filtroFrecuentes: boolean | null = null;
  filtroConPases: boolean | null = null;

  columnasVisibles = ['avatar', 'info', 'contacto', 'stats', 'estado', 'acciones'];

  constructor(
    private clienteService: ClienteService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.loading = true;
    this.clienteService.obtenerTodosLosClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando clientes:', error);
        this.snackBar.open('Error al cargar los clientes', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
    let filtrados = [...this.clientes];

    // Filtro por texto
    if (this.filtroTexto.trim()) {
      const texto = this.filtroTexto.toLowerCase();
      filtrados = filtrados.filter(cliente =>
        cliente.nombre.toLowerCase().includes(texto) ||
        cliente.apellido.toLowerCase().includes(texto) ||
        cliente.email.toLowerCase().includes(texto) ||
        (cliente.dni && cliente.dni.includes(texto))
      );
    }

    // Filtro por activos
    if (this.filtroActivos !== null) {
      filtrados = filtrados.filter(cliente =>
        this.filtroActivos ? cliente.activo !== false : cliente.activo === false
      );
    }

    // Filtro por frecuentes
    if (this.filtroFrecuentes !== null) {
      filtrados = filtrados.filter(cliente =>
        this.filtroFrecuentes ? cliente.esClienteFrecuente === true : cliente.esClienteFrecuente !== true
      );
    }

    // Filtro por pases
    if (this.filtroConPases !== null) {
      filtrados = filtrados.filter(cliente =>
        this.filtroConPases ? (cliente.pasesGratuitos && cliente.pasesGratuitos > 0) : !(cliente.pasesGratuitos && cliente.pasesGratuitos > 0)
      );
    }

    this.clientesFiltrados = filtrados;
  }

  toggleFiltroActivos(valor: boolean): void {
    this.filtroActivos = this.filtroActivos === valor ? null : valor;
    this.aplicarFiltros();
  }

  toggleFiltroFrecuentes(valor: boolean): void {
    this.filtroFrecuentes = this.filtroFrecuentes === valor ? null : valor;
    this.aplicarFiltros();
  }

  toggleFiltroConPases(valor: boolean): void {
    this.filtroConPases = this.filtroConPases === valor ? null : valor;
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroActivos = null;
    this.filtroFrecuentes = null;
    this.filtroConPases = null;
    this.aplicarFiltros();
  }

  abrirFormularioNuevo(): void {
    const dialogRef = this.dialog.open(ClienteFormComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarClientes();
        this.snackBar.open('Cliente creado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  editarCliente(cliente: Cliente): void {
    const dialogRef = this.dialog.open(ClienteFormComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { isEdit: true, cliente: cliente }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarClientes();
        this.snackBar.open('Cliente actualizado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  verDetalles(cliente: Cliente): void {
  const dialogRef = this.dialog.open(ClienteDetallesComponent, {
    width: '700px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    data: cliente
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result?.action === 'edit') {
      // Si el usuario quiere editar desde el modal de detalles
      this.editarCliente(result.cliente);
    }
  });
}

  toggleActivoCliente(cliente: Cliente): void {
  const nuevoEstado = !cliente.activo;
  const accion = nuevoEstado ? 'activar' : 'desactivar';
  
  if (confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} a ${cliente.nombre} ${cliente.apellido}?`)) {
    
    this.clienteService.toggleActivoCliente(cliente.id!, nuevoEstado).subscribe({
      next: () => {
        // Actualizar el estado local
        cliente.activo = nuevoEstado;
        this.aplicarFiltros(); // Reaplicar filtros
        
        this.snackBar.open(`Cliente ${accion}do exitosamente`, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error(`Error al ${accion} cliente:`, error);
        
        this.snackBar.open(`Error al ${accion} el cliente`, 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}

  obtenerIniciales(nombre: string, apellido: string): string {
    return (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
  }

  contarClientesFrecuentes(): number {
    return this.clientes.filter(c => c.esClienteFrecuente === true).length;
  }

  contarClientesConPases(): number {
    return this.clientes.filter(c => c.pasesGratuitos && c.pasesGratuitos > 0).length;
  }
}