// src/app/components/reservas/crear-reserva/crear-reserva.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { ReservaService } from '../../../services/reserva';
import { ClienteService } from '../../../services/cliente';
import { EventoService } from '../../../services/evento';
import { Cliente, ClienteResumen } from '../../../models/cliente';
import { Evento, EventoResumen, TipoEntrada } from '../../../models/evento';
import { ReservaRequest } from '../../../models/reserva';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-crear-reserva',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="crear-reserva-container">
      <!-- Header -->
      <div class="page-header">
        <button mat-icon-button (click)="volver()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="page-title">
          <mat-icon>add_circle_outline</mat-icon>
          Nueva Reserva
        </h1>
      </div>

      <!-- Stepper -->
      <mat-card class="stepper-card">
        <mat-card-content>
          <mat-stepper [linear]="true" #stepper>
            
            <!-- Paso 1: Cliente -->
            <mat-step [stepControl]="clienteForm" label="Cliente">
              <form [formGroup]="clienteForm">
                <div class="step-content">
                  <h2>Seleccionar Cliente</h2>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Buscar cliente</mat-label>
                    <input matInput 
                           formControlName="busquedaCliente" 
                           [matAutocomplete]="autoCliente"
                           (input)="buscarClientes($event)"
                           placeholder="Escriba nombre, apellido o email...">
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>

                  <mat-autocomplete #autoCliente="matAutocomplete" 
                                    (optionSelected)="seleccionarCliente($event.option.value)">
                    <mat-option *ngFor="let cliente of clientesFiltrados" [value]="cliente">
                      <div class="cliente-option">
                        <div>
                          <strong>{{ cliente.nombre }} {{ cliente.apellido }}</strong>
                          <div style="font-size: 0.9rem; color: #666;">{{ cliente.email }}</div>
                          <div style="font-size: 0.8rem; color: #999;">{{ cliente.eventosAsistidos || 0 }} eventos asistidos</div>
                        </div>
                        <div *ngIf="cliente.pasesGratuitos && cliente.pasesGratuitos > 0" class="pases-badge">
                          🎁 {{ cliente.pasesGratuitos }} pases
                        </div>
                      </div>
                    </mat-option>
                    <mat-option *ngIf="clientesFiltrados.length === 0 && filtroCliente.length > 2" disabled>
                      No se encontraron clientes
                    </mat-option>
                  </mat-autocomplete>

                  <div *ngIf="clienteSeleccionado" class="cliente-seleccionado-card">
                    <div class="cliente-info">
                      <h3>{{ clienteSeleccionado.nombre }} {{ clienteSeleccionado.apellido }}</h3>
                      <p class="cliente-email">{{ clienteSeleccionado.email }}</p>
                      <div class="cliente-stats">
                        <span class="stat-item">
                          <mat-icon>event_seat</mat-icon>
                          {{ clienteSeleccionado.eventosAsistidos || 0 }} eventos
                        </span>
                        <span class="stat-item" *ngIf="clienteSeleccionado.pasesGratuitos && clienteSeleccionado.pasesGratuitos > 0">
                          <mat-icon>card_giftcard</mat-icon>
                          {{ clienteSeleccionado.pasesGratuitos }} pases gratuitos
                        </span>
                      </div>
                    </div>
                    <button mat-button color="primary" (click)="limpiarCliente()">
                      <mat-icon>edit</mat-icon>
                      Cambiar cliente
                    </button>
                  </div>

                  <div *ngIf="!clienteSeleccionado" class="instrucciones">
                    <mat-icon class="instrucciones-icon">search</mat-icon>
                    <p>Escriba al menos 2 caracteres para buscar un cliente existente.</p>
                    <p class="nota">Si el cliente no existe, debe ser creado desde la sección de Clientes.</p>
                  </div>

                  <div class="step-actions">
                    <button mat-raised-button color="primary" matStepperNext [disabled]="!clienteSeleccionado">
                      <mat-icon>arrow_forward</mat-icon>
                      Siguiente
                    </button>
                  </div>
                </div>
              </form>
            </mat-step>

            <!-- Paso 2: Evento -->
            <mat-step [stepControl]="eventoForm" label="Evento">
              <form [formGroup]="eventoForm">
                <div class="step-content">
                  <h2>Seleccionar Evento</h2>

                  <div *ngIf="eventosDisponibles.length === 0" class="no-eventos">
                    <mat-icon class="no-eventos-icon">event_busy</mat-icon>
                    <p>No hay eventos disponibles en este momento</p>
                  </div>

                  <div *ngFor="let eventoItem of eventosDisponibles" 
                       class="evento-card"
                       [class.selected]="eventoSeleccionado?.id === eventoItem.id"
                       (click)="seleccionarEvento(eventoItem)">
                    <div class="evento-header">
                      <h3>{{ eventoItem.nombre }}</h3>
                      <span class="evento-tipo">{{ getTipoEventoTexto(eventoItem.tipoEvento) }}</span>
                    </div>
                    <div class="evento-details">
                      <div class="detail-item">
                        <mat-icon>schedule</mat-icon>
                        <span>{{ formatearFecha(eventoItem.fechaHora) }} - {{ formatearHora(eventoItem.fechaHora) }}</span>
                      </div>
                      <div class="detail-item">
                        <mat-icon>people</mat-icon>
                        <span>{{ eventoItem.capacidadDisponible }} disponibles de {{ eventoItem.capacidadTotal }}</span>
                      </div>
                      <div class="detail-item">
                        <mat-icon>attach_money</mat-icon>
                        <span>Desde \${{ eventoItem.precioDesde }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="step-actions">
                    <button mat-button matStepperPrevious>
                      <mat-icon>arrow_back</mat-icon>
                      Anterior
                    </button>
                    <button mat-raised-button color="primary" matStepperNext [disabled]="!eventoSeleccionado">
                      <mat-icon>arrow_forward</mat-icon>
                      Siguiente
                    </button>
                  </div>
                </div>
              </form>
            </mat-step>

            <!-- Paso 3: Configuración -->
            <mat-step [stepControl]="reservaForm" label="Configuración">
              <form [formGroup]="reservaForm">
                <div class="step-content">
                  <h2>Configurar Reserva</h2>

                  <div class="evento-info-banner">
                    <h3>{{ eventoSeleccionado?.nombre }}</h3>
                    <p>{{ getTipoEventoTexto(eventoSeleccionado?.tipoEvento) }}</p>
                  </div>

                  <h3>Seleccione el tipo de entrada:</h3>
                  
                  <div *ngIf="tiposEntradaDisponibles.length === 0" class="loading-entradas">
                    <mat-spinner diameter="30"></mat-spinner>
                    <p>Cargando tipos de entrada...</p>
                  </div>

                  <div *ngFor="let entradaItem of tiposEntradaDisponibles" 
                       class="entrada-option"
                       [class.selected]="tipoEntradaSeleccionado === entradaItem.tipo"
                       [class.sin-disponibilidad]="entradaItem.disponible === 0"
                       (click)="seleccionarTipoEntrada(entradaItem.tipo, entradaItem.precio)">
                    <div class="entrada-header">
                      <h4>{{ getNombreTipoEntrada(entradaItem.tipo) }}</h4>
                      <span class="entrada-precio">\${{ entradaItem.precio }}</span>
                    </div>
                    <div class="entrada-disponibilidad">
                      <mat-icon [style.color]="entradaItem.disponible > 0 ? '#4caf50' : '#f44336'">
                        {{ entradaItem.disponible > 0 ? 'check_circle' : 'cancel' }}
                      </mat-icon>
                      <span>{{ entradaItem.disponible }} disponibles</span>
                    </div>
                  </div>

                  <div *ngIf="clienteSeleccionado && clienteSeleccionado.pasesGratuitos && clienteSeleccionado.pasesGratuitos > 0" class="pase-gratuito-section">
                    <mat-divider></mat-divider>
                    <mat-checkbox formControlName="usarPaseGratuito" 
                                  (change)="togglePaseGratuito($event.checked)"
                                  [disabled]="!tipoEntradaSeleccionado">
                      <div class="pase-gratuito-option">
                        <mat-icon>card_giftcard</mat-icon>
                        <span>Usar pase gratuito ({{ clienteSeleccionado.pasesGratuitos }} disponibles)</span>
                      </div>
                    </mat-checkbox>
                  </div>

                  <div class="step-actions">
                    <button mat-button matStepperPrevious>
                      <mat-icon>arrow_back</mat-icon>
                      Anterior
                    </button>
                    <button mat-raised-button color="primary" matStepperNext [disabled]="!tipoEntradaSeleccionado">
                      <mat-icon>arrow_forward</mat-icon>
                      Siguiente
                    </button>
                  </div>
                </div>
              </form>
            </mat-step>

            <!-- Paso 4: Confirmar -->
            <mat-step label="Confirmar">
              <div class="step-content">
                <h2>Confirmar Reserva</h2>

                <div class="resumen-final">
                  <div class="resumen-section">
                    <h3>
                      <mat-icon>person</mat-icon>
                      Cliente
                    </h3>
                    <p><strong>{{ clienteSeleccionado?.nombre }} {{ clienteSeleccionado?.apellido }}</strong></p>
                    <p class="detalle">{{ clienteSeleccionado?.email }}</p>
                  </div>

                  <mat-divider></mat-divider>
                  
                  <div class="resumen-section">
                    <h3>
                      <mat-icon>event</mat-icon>
                      Evento
                    </h3>
                    <p><strong>{{ eventoSeleccionado?.nombre }}</strong></p>
                    <p class="detalle">{{ formatearFecha(eventoSeleccionado?.fechaHora || '') }} - {{ formatearHora(eventoSeleccionado?.fechaHora || '') }}</p>
                  </div>

                  <mat-divider></mat-divider>
                  
                  <div class="resumen-section">
                    <h3>
                      <mat-icon>local_activity</mat-icon>
                      Entrada
                    </h3>
                    <p><strong>{{ getNombreTipoEntrada(tipoEntradaSeleccionado) }}</strong></p>
                  </div>

                  <mat-divider></mat-divider>
                  
                  <div class="resumen-section total">
                    <h3>
                      <mat-icon>{{ usandoPaseGratuito ? 'card_giftcard' : 'attach_money' }}</mat-icon>
                      Total
                    </h3>
                    <p class="precio-final" [class.gratuito]="usandoPaseGratuito">
                      {{ usandoPaseGratuito ? 'PASE GRATUITO' : '$' + precioFinal }}
                    </p>
                  </div>
                </div>

                <div class="step-actions">
                  <button mat-button matStepperPrevious>
                    <mat-icon>arrow_back</mat-icon>
                    Anterior
                  </button>
                  <button mat-raised-button color="primary" (click)="crearReserva()" [disabled]="creandoReserva">
                    <mat-spinner diameter="20" *ngIf="creandoReserva"></mat-spinner>
                    <mat-icon *ngIf="!creandoReserva">check</mat-icon>
                    {{ creandoReserva ? 'Creando...' : 'Crear Reserva' }}
                  </button>
                </div>
              </div>
            </mat-step>

          </mat-stepper>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .crear-reserva-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      color: #333;
    }

    .stepper-card {
      margin-bottom: 24px;
    }

    .step-content {
      padding: 24px 0;
    }

    .full-width {
      width: 100%;
    }

    /* Cliente */
    .cliente-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 8px 0;
    }

    .pases-badge {
      background: #e8f5e8;
      color: #2e7d32;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .cliente-seleccionado-card {
      border: 2px solid #4caf50;
      border-radius: 12px;
      padding: 20px;
      margin: 16px 0;
      background: #f8fff8;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .cliente-info h3 {
      margin: 0 0 8px 0;
      color: #2e7d32;
    }

    .cliente-email {
      color: #666;
      margin: 0 0 12px 0;
    }

    .cliente-stats {
      display: flex;
      gap: 16px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.9rem;
      color: #555;
    }

    .stat-item mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    .instrucciones {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .instrucciones-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #ccc;
      margin-bottom: 16px;
    }

    .nota {
      font-size: 0.9rem;
      color: #999;
      font-style: italic;
    }

    /* Eventos */
    .no-eventos {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .no-eventos-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #ccc;
      margin-bottom: 16px;
    }

    .evento-card {
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 20px;
      margin: 12px 0;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .evento-card:hover {
      border-color: #1976d2;
      box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
    }

    .evento-card.selected {
      border-color: #1976d2;
      background: #f0f8ff;
    }

    .evento-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .evento-header h3 {
      margin: 0;
      color: #333;
    }

    .evento-tipo {
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .evento-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 0.9rem;
    }

    .detail-item mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
      color: #999;
    }

    /* Configuración */
    .evento-info-banner {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      text-align: center;
    }

    .evento-info-banner h3 {
      margin: 0 0 4px 0;
      color: #333;
    }

    .evento-info-banner p {
      margin: 0;
      color: #666;
      font-style: italic;
    }

    .loading-entradas {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .entrada-option {
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 16px;
      margin: 12px 0;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .entrada-option:hover:not(.sin-disponibilidad) {
      border-color: #1976d2;
      box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
    }

    .entrada-option.selected {
      border-color: #1976d2;
      background: #f0f8ff;
    }

    .entrada-option.sin-disponibilidad {
      opacity: 0.5;
      cursor: not-allowed;
      background: #fafafa;
    }

    .entrada-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .entrada-header h4 {
      margin: 0;
      color: #333;
    }

    .entrada-precio {
      color: #4caf50;
      font-weight: bold;
      font-size: 1.1rem;
    }

    .entrada-disponibilidad {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 0.9rem;
    }

    .pase-gratuito-section {
      margin-top: 24px;
      padding-top: 24px;
    }

    .pase-gratuito-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Resumen */
    .resumen-final {
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 24px;
      margin: 16px 0;
      background: #fafafa;
    }

    .resumen-section {
      margin: 16px 0;
    }

    .resumen-section h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 8px 0;
      color: #333;
      font-size: 1rem;
    }

    .resumen-section p {
      margin: 4px 0;
    }

    .detalle {
      color: #666;
      font-size: 0.9rem;
    }

    .resumen-section.total {
      text-align: center;
      margin-top: 20px;
    }

    .precio-final {
      font-size: 2rem;
      font-weight: bold;
      color: #4caf50;
    }

    .precio-final.gratuito {
      color: #ff9800;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 32px;
    }

    .step-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .crear-reserva-container {
        padding: 16px;
      }

      .cliente-seleccionado-card {
        flex-direction: column;
        text-align: center;
        gap: 16px;
      }

      .cliente-stats {
        justify-content: center;
      }

      .evento-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .entrada-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .step-actions {
        flex-direction: column;
        gap: 12px;
      }
    }
  `]
})
export class CrearReservaComponent implements OnInit {
  // Formularios - inicializados en constructor
  clienteForm!: FormGroup;
  eventoForm!: FormGroup;
  reservaForm!: FormGroup;

  // Estados
  clienteSeleccionado: ClienteResumen | null = null;
  eventoSeleccionado: EventoResumen | null = null;
  tipoEntradaSeleccionado: TipoEntrada | null = null;
  precioFinal = 0;
  usandoPaseGratuito = false;
  creandoReserva = false;

  // Datos
  eventosDisponibles: EventoResumen[] = [];
  tiposEntradaDisponibles: Array<{tipo: TipoEntrada, precio: number, disponible: number}> = [];
  clientesFiltrados: ClienteResumen[] = [];
  filtroCliente = '';

  // Mapeos
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
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private reservaService: ReservaService,
    private clienteService: ClienteService,
    private eventoService: EventoService
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.cargarEventosDisponibles();
  }

  initForms(): void {
    this.clienteForm = this.fb.group({
      busquedaCliente: ['', Validators.required]
    });

    this.eventoForm = this.fb.group({
      eventoId: ['', Validators.required]
    });

    this.reservaForm = this.fb.group({
      tipoEntrada: ['', Validators.required],
      usarPaseGratuito: [false]
    });
  }

  limpiarCliente(): void {
    this.clienteSeleccionado = null;
    this.clientesFiltrados = [];
    this.filtroCliente = '';
    this.clienteForm.patchValue({ busquedaCliente: '' });
  }

  buscarClientes(event: any): void {
    const termino = event.target.value;
    this.filtroCliente = termino;
    
    if (termino.length >= 2) {
      this.clienteService.buscarClientesPorNombre(termino).subscribe({
        next: (clientes) => {
          this.clientesFiltrados = clientes;
        },
        error: (error) => {
          console.error('Error buscando clientes:', error);
          this.snackBar.open('Error al buscar clientes', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.clientesFiltrados = [];
    }
  }

  seleccionarCliente(cliente: ClienteResumen): void {
    this.clienteSeleccionado = cliente;
    this.clientesFiltrados = [];
    this.clienteForm.patchValue({ 
      busquedaCliente: `${cliente.nombre} ${cliente.apellido}` 
    });
  }

  cargarEventosDisponibles(): void {
    this.eventoService.obtenerEventosConDisponibilidad().subscribe({
      next: (eventos) => {
        this.eventosDisponibles = eventos;
      },
      error: (error) => {
        console.error('Error cargando eventos:', error);
        this.snackBar.open('Error al cargar eventos disponibles', 'Cerrar', { duration: 3000 });
      }
    });
  }

  seleccionarEvento(evento: EventoResumen): void {
    this.eventoSeleccionado = evento;
    this.eventoForm.patchValue({ eventoId: evento.id });
    this.cargarTiposEntradaDisponibles();
  }

  cargarTiposEntradaDisponibles(): void {
    if (!this.eventoSeleccionado) return;

    // Obtener la configuración real del evento desde el servicio
    this.eventoService.obtenerEvento(this.eventoSeleccionado.id).subscribe({
      next: (eventoCompleto) => {
        this.procesarTiposEntradaDelEvento(eventoCompleto);
      },
      error: (error) => {
        console.error('Error cargando detalles del evento:', error);
        this.snackBar.open('Error al cargar tipos de entrada', 'Cerrar', { duration: 3000 });
      }
    });
  }

  procesarTiposEntradaDelEvento(evento: Evento): void {
    const tiposDisponibles: Array<{tipo: TipoEntrada, precio: number, disponible: number}> = [];

    // Si el evento tiene configuración de precios y capacidades
    if (evento.precios && evento.capacidades && evento.disponibilidadPorTipo) {
      // Procesar cada tipo de entrada configurado
      Object.keys(evento.precios).forEach(tipoKey => {
        const tipo = tipoKey as TipoEntrada;
        const precio = evento.precios![tipoKey];
        const disponible = evento.disponibilidadPorTipo![tipoKey] || 0;

        tiposDisponibles.push({
          tipo,
          precio,
          disponible
        });
      });
    }

    this.tiposEntradaDisponibles = tiposDisponibles;
  }

  seleccionarTipoEntrada(tipo: TipoEntrada, precio: number): void {
    // No permitir seleccionar si no hay disponibilidad
    const tipoInfo = this.tiposEntradaDisponibles.find(t => t.tipo === tipo);
    if (!tipoInfo || tipoInfo.disponible === 0) {
      this.snackBar.open('No hay disponibilidad para este tipo de entrada', 'Cerrar', { duration: 3000 });
      return;
    }

    this.tipoEntradaSeleccionado = tipo;
    this.precioFinal = precio;
    this.reservaForm.patchValue({ tipoEntrada: tipo });
    
    // Resetear pase gratuito si estaba activado
    if (this.usandoPaseGratuito) {
      this.usandoPaseGratuito = false;
      this.reservaForm.patchValue({ usarPaseGratuito: false });
    }
  }

  togglePaseGratuito(usar: boolean): void {
    this.usandoPaseGratuito = usar;
    this.precioFinal = usar ? 0 : this.tiposEntradaDisponibles.find(t => t.tipo === this.tipoEntradaSeleccionado)?.precio || 0;
  }

  crearReserva(): void {
    if (!this.clienteSeleccionado || !this.eventoSeleccionado || !this.tipoEntradaSeleccionado) {
      this.snackBar.open('Faltan datos para crear la reserva', 'Cerrar', { duration: 3000 });
      return;
    }

    this.creandoReserva = true;

    const reservaRequest: ReservaRequest = {
      clienteId: this.clienteSeleccionado.id,
      eventoId: this.eventoSeleccionado.id,
      tipoEntrada: this.tipoEntradaSeleccionado,
      usarPaseGratuito: this.usandoPaseGratuito
    };

    this.reservaService.crearReserva(reservaRequest).subscribe({
      next: (reserva) => {
        this.snackBar.open('Reserva creada exitosamente', 'Cerrar', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/reservas']);
      },
      error: (error) => {
        console.error('Error creando reserva:', error);
        this.snackBar.open('Error al crear la reserva', 'Cerrar', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.creandoReserva = false;
      }
    });
  }

  // Métodos de utilidad
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatearHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  getNombreTipoEntrada(tipo: TipoEntrada | null): string {
    if (!tipo) return '';
    return this.tiposEntradaNombres[tipo] || tipo;
  }

  getTipoEventoTexto(tipoEvento: any): string {
    const tipos = {
      'OBRA_TEATRO': 'Obra de Teatro',
      'RECITAL': 'Recital/Concierto', 
      'CHARLA_CONFERENCIA': 'Charla/Conferencia'
    };
    return tipos[tipoEvento as keyof typeof tipos] || tipoEvento;
  }

  volver(): void {
    this.router.navigate(['/reservas']);
  }
}