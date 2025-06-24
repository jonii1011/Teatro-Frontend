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
                        </div>
                        <div *ngIf="cliente.pasesGratuitos > 0" style="color: #4caf50;">
                          🎁 {{ cliente.pasesGratuitos }} pases
                        </div>
                      </div>
                    </mat-option>
                    <mat-option *ngIf="clientesFiltrados.length === 0 && filtroCliente.length > 2" disabled>
                      No se encontraron clientes
                    </mat-option>
                  </mat-autocomplete>

                  <div *ngIf="clienteSeleccionado" class="cliente-card">
                    <h3>{{ clienteSeleccionado.nombre }} {{ clienteSeleccionado.apellido }}</h3>
                    <p>{{ clienteSeleccionado.email }}</p>
                    <button mat-button (click)="limpiarCliente()">Cambiar cliente</button>
                  </div>

                  <div *ngIf="!clienteSeleccionado">
                    <h3>Crear nuevo cliente</h3>
                    <div class="form-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Nombre</mat-label>
                        <input matInput formControlName="nombre">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Apellido</mat-label>
                        <input matInput formControlName="apellido">
                      </mat-form-field>
                    </div>
                    <div class="form-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Email</mat-label>
                        <input matInput type="email" formControlName="email">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>DNI</mat-label>
                        <input matInput formControlName="dni">
                      </mat-form-field>
                    </div>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Fecha de Nacimiento</mat-label>
                      <input matInput type="date" formControlName="fechaNacimiento">
                    </mat-form-field>
                    <button mat-raised-button color="primary" (click)="crearCliente()">
                      Crear Cliente
                    </button>
                  </div>

                  <div class="step-actions">
                    <button mat-raised-button color="primary" matStepperNext [disabled]="!clienteSeleccionado">
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

                  <div *ngFor="let evento of eventosDisponibles" 
                       class="evento-card"
                       [class.selected]="eventoSeleccionado?.id === evento.id"
                       (click)="seleccionarEvento(evento)">
                    <h3>{{ evento.nombre }}</h3>
                    <p>{{ formatearFecha(evento.fechaHora) }} - {{ formatearHora(evento.fechaHora) }}</p>
                    <p>Disponibles: {{ evento.capacidadDisponible }}</p>
                    <p>Desde: {{ '$' + evento.precioDesde }}</p>
                  </div>

                  <div class="step-actions">
                    <button mat-button matStepperPrevious>Anterior</button>
                    <button mat-raised-button color="primary" matStepperNext [disabled]="!eventoSeleccionado">
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

                  <h3>Tipos de entrada para {{ eventoSeleccionado?.nombre }}:</h3>
                  <p class="evento-tipo-info">Tipo de evento: {{ getTipoEventoTexto(eventoSeleccionado?.tipoEvento) }}</p>
                  <div *ngFor="let tipoInfo of tiposEntradaDisponibles" 
                       class="entrada-option"
                       [class.selected]="tipoEntradaSeleccionado === tipoInfo.tipo"
                       (click)="seleccionarTipoEntrada(tipoInfo.tipo, tipoInfo.precio)">
                    <h4>{{ getNombreTipoEntrada(tipoInfo.tipo) }}</h4>
                    <p>{{ '$' + tipoInfo.precio }}</p>
                    <p>{{ tipoInfo.disponible }} disponibles</p>
                  </div>

                  <div *ngIf="clienteSeleccionado && clienteSeleccionado.pasesGratuitos > 0">
                    <mat-checkbox formControlName="usarPaseGratuito" (change)="togglePaseGratuito($event.checked)">
                      Usar pase gratuito ({{ clienteSeleccionado?.pasesGratuitos }} disponibles)
                    </mat-checkbox>
                  </div>

                  <div class="step-actions">
                    <button mat-button matStepperPrevious>Anterior</button>
                    <button mat-raised-button color="primary" matStepperNext [disabled]="!tipoEntradaSeleccionado">
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

                <div class="resumen">
                  <h3>Cliente:</h3>
                  <p>{{ clienteSeleccionado?.nombre }} {{ clienteSeleccionado?.apellido }}</p>
                  
                  <h3>Evento:</h3>
                  <p>{{ eventoSeleccionado?.nombre }}</p>
                  
                  <h3>Entrada:</h3>
                  <p>{{ getNombreTipoEntrada(tipoEntradaSeleccionado) }}</p>
                  
                  <h3>Total:</h3>
                  <p *ngIf="!usandoPaseGratuito">{{ '$' + precioFinal }}</p>
                  <p *ngIf="usandoPaseGratuito">PASE GRATUITO</p>
                </div>

                <div class="step-actions">
                  <button mat-button matStepperPrevious>Anterior</button>
                  <button mat-raised-button color="primary" (click)="crearReserva()" [disabled]="creandoReserva">
                    <mat-spinner diameter="20" *ngIf="creandoReserva"></mat-spinner>
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

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .cliente-card {
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    }

    .evento-card {
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      margin: 8px 0;
      cursor: pointer;
    }

    .evento-card:hover {
      border-color: #1976d2;
    }

    .evento-card.selected {
      border-color: #1976d2;
      background: #f0f8ff;
    }

    .entrada-option {
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      margin: 8px 0;
      cursor: pointer;
    }

    .entrada-option:hover {
      border-color: #1976d2;
    }

    .entrada-option.selected {
      border-color: #1976d2;
      background: #f0f8ff;
    }

    .resumen {
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
    }

    .cliente-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 8px 0;
    }

    .evento-tipo-info {
      color: #666;
      font-style: italic;
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
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
      busquedaCliente: [''],
      nombre: [''],
      apellido: [''],
      email: [''],
      dni: [''],
      fechaNacimiento: ['']
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
          // Datos de ejemplo para desarrollo
          this.clientesFiltrados = [
            { id: 1, nombre: 'Juan', apellido: 'Pérez', email: 'juan@email.com', eventosAsistidos: 3, pasesGratuitos: 1 },
            { id: 2, nombre: 'María', apellido: 'González', email: 'maria@email.com', eventosAsistidos: 5, pasesGratuitos: 0 },
            { id: 3, nombre: 'Carlos', apellido: 'López', email: 'carlos@email.com', eventosAsistidos: 8, pasesGratuitos: 2 }
          ].filter(cliente => 
            cliente.nombre.toLowerCase().includes(termino.toLowerCase()) ||
            cliente.apellido.toLowerCase().includes(termino.toLowerCase()) ||
            cliente.email.toLowerCase().includes(termino.toLowerCase())
          );
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

  crearCliente(): void {
    const { nombre, apellido, email, dni, fechaNacimiento } = this.clienteForm.value;
    
    if (!nombre || !apellido || !email || !dni || !fechaNacimiento) {
      this.snackBar.open('Complete todos los campos obligatorios', 'Cerrar', { duration: 3000 });
      return;
    }

    const nuevoCliente = { nombre, apellido, email, dni, fechaNacimiento };

    this.clienteService.crearCliente(nuevoCliente).subscribe({
      next: (cliente) => {
        this.clienteSeleccionado = {
          id: cliente.id!,
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          email: cliente.email,
          eventosAsistidos: 0,
          pasesGratuitos: 0
        };
        this.snackBar.open('Cliente creado exitosamente', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error creando cliente:', error);
        this.snackBar.open('Error al crear el cliente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarEventosDisponibles(): void {
    this.eventoService.obtenerEventosConDisponibilidad().subscribe({
      next: (eventos) => {
        this.eventosDisponibles = eventos;
      },
      error: (error) => {
        console.error('Error cargando eventos:', error);
        // Datos de ejemplo para desarrollo con configuraciones reales
        this.eventosDisponibles = [
          { 
            id: 1, 
            nombre: 'Romeo y Julieta', 
            fechaHora: '2024-07-15T20:00:00', 
            capacidadDisponible: 45, 
            capacidadTotal: 150, 
            estaVigente: true, 
            precioDesde: 1800,
            tipoEvento: 'OBRA_TEATRO' as any
          },
          { 
            id: 2, 
            nombre: 'Concierto Rock Nacional', 
            fechaHora: '2024-07-20T21:30:00', 
            capacidadDisponible: 120, 
            capacidadTotal: 500, 
            estaVigente: true, 
            precioDesde: 2800,
            tipoEvento: 'RECITAL' as any
          },
          { 
            id: 3, 
            nombre: 'Conferencia de Tecnología', 
            fechaHora: '2024-07-25T19:00:00', 
            capacidadDisponible: 80, 
            capacidadTotal: 150, 
            estaVigente: true, 
            precioDesde: 800,
            tipoEvento: 'CHARLA_CONFERENCIA' as any
          }
        ];
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
        // Fallback: usar datos simulados basados en el tipo de evento
        this.cargarTiposEntradaSimulados();
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
        const capacidadTotal = evento.capacidades![tipoKey] || 0;
        const disponible = evento.disponibilidadPorTipo![tipoKey] || 0;

        tiposDisponibles.push({
          tipo,
          precio,
          disponible
        });
      });
    } else if (evento.tiposEntrada) {
      // Si solo tiene tipos de entrada sin configuración detallada
      evento.tiposEntrada.forEach(tipo => {
        const precio = evento.precios?.[tipo] || 1000; // Precio por defecto
        const disponible = Math.floor(evento.capacidadTotal / evento.tiposEntrada!.length);
        
        tiposDisponibles.push({
          tipo,
          precio,
          disponible
        });
      });
    } else {
      // Fallback: usar tipos según el tipo de evento
      this.cargarTiposEntradaSimulados();
      return;
    }

    this.tiposEntradaDisponibles = tiposDisponibles;
  }

  cargarTiposEntradaSimulados(): void {
    if (!this.eventoSeleccionado) return;

    // Solo como fallback - estos precios deberían venir del evento real
    let tiposParaEvento: Array<{tipo: TipoEntrada, precio: number, disponible: number}> = [];

    switch (this.eventoSeleccionado.tipoEvento) {
      case 'OBRA_TEATRO':
        tiposParaEvento = [
          { tipo: TipoEntrada.GENERAL, precio: 2500, disponible: 45 },
          { tipo: TipoEntrada.VIP, precio: 4000, disponible: 12 }
        ];
        break;
      
      case 'RECITAL':
        tiposParaEvento = [
          { tipo: TipoEntrada.CAMPO, precio: 3500, disponible: 200 },
          { tipo: TipoEntrada.PLATEA, precio: 5000, disponible: 80 },
          { tipo: TipoEntrada.PALCO, precio: 8000, disponible: 20 }
        ];
        break;
      
      case 'CHARLA_CONFERENCIA':
        tiposParaEvento = [
          { tipo: TipoEntrada.SIN_MEET_GREET, precio: 1500, disponible: 100 },
          { tipo: TipoEntrada.CON_MEET_GREET, precio: 3000, disponible: 30 }
        ];
        break;
      
      default:
        tiposParaEvento = [
          { tipo: TipoEntrada.GENERAL, precio: 2500, disponible: 45 }
        ];
    }

    this.tiposEntradaDisponibles = tiposParaEvento;
  }

  seleccionarTipoEntrada(tipo: TipoEntrada, precio: number): void {
    this.tipoEntradaSeleccionado = tipo;
    this.precioFinal = precio;
    this.reservaForm.patchValue({ tipoEntrada: tipo });
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
        this.snackBar.open('Reserva creada exitosamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/reservas']);
      },
      error: (error) => {
        console.error('Error creando reserva:', error);
        this.snackBar.open('Error al crear la reserva', 'Cerrar', { duration: 3000 });
        this.creandoReserva = false;
      }
    });
  }

  // Métodos de utilidad
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  formatearHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
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