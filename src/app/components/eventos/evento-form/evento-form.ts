import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { provideNativeDateAdapter } from '@angular/material/core';

import { EventoService } from '../../../services/evento';
import { Evento, EventoRequest, TipoEvento, TipoEntrada, ConfiguracionEntrada } from '../../../models/evento';

export interface EventoFormData {
  evento?: Evento;
  isEdit: boolean;
}

@Component({
  selector: 'app-evento-form',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatSelectModule,
    MatCardModule,
    MatDividerModule
  ],
  template: `
    <div class="evento-form-container">
      <h2 mat-dialog-title class="form-title">
        <mat-icon>{{ data.isEdit ? 'edit' : 'event' }}</mat-icon>
        {{ data.isEdit ? 'Editar Evento' : 'Nuevo Evento' }}
      </h2>

      <mat-dialog-content class="form-content">
        <form [formGroup]="eventoForm" class="evento-form">
          
          <!-- Información Básica -->
          <div class="form-section">
            <h3 class="section-title">
              <mat-icon>info</mat-icon>
              Información Básica
            </h3>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Nombre del Evento *</mat-label>
                <input matInput 
                       formControlName="nombre" 
                       placeholder="Ej: Romeo y Julieta"
                       maxlength="100">
                <mat-icon matSuffix>event</mat-icon>
                <mat-error *ngIf="eventoForm.get('nombre')?.hasError('required')">
                  El nombre es obligatorio
                </mat-error>
                <mat-error *ngIf="eventoForm.get('nombre')?.hasError('minlength')">
                  El nombre debe tener al menos 3 caracteres
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Tipo de Evento *</mat-label>
                <mat-select formControlName="tipoEvento" (selectionChange)="onTipoEventoChange()">
                  <mat-option value="OBRA_TEATRO">
                    <mat-icon>theater_comedy</mat-icon>
                    Obra de Teatro
                  </mat-option>
                  <mat-option value="RECITAL">
                    <mat-icon>music_note</mat-icon>
                    Recital
                  </mat-option>
                  <mat-option value="CHARLA_CONFERENCIA">
                    <mat-icon>school</mat-icon>
                    Charla/Conferencia
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="eventoForm.get('tipoEvento')?.hasError('required')">
                  Seleccione un tipo de evento
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field full-width">
                <mat-label>Descripción *</mat-label>
                <textarea matInput 
                          formControlName="descripcion"
                          placeholder="Describe el evento..."
                          rows="3"
                          maxlength="500"></textarea>
                <mat-icon matSuffix>description</mat-icon>
                <mat-hint>{{ eventoForm.get('descripcion')?.value?.length || 0 }}/500</mat-hint>
                <mat-error *ngIf="eventoForm.get('descripcion')?.hasError('required')">
                  La descripción es obligatoria
                </mat-error>
              </mat-form-field>
            </div>
          </div>

          <!-- Fecha y Hora -->
          <div class="form-section">
            <h3 class="section-title">
              <mat-icon>schedule</mat-icon>
              Fecha y Hora
            </h3>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Fecha *</mat-label>
                <input matInput 
                       [matDatepicker]="fechaPicker" 
                       formControlName="fecha"
                       placeholder="Seleccione fecha"
                       readonly>
                <mat-datepicker-toggle matSuffix [for]="fechaPicker">
                  <mat-icon matDatepickerToggleIcon>calendar_today</mat-icon>
                </mat-datepicker-toggle>
                <mat-datepicker #fechaPicker></mat-datepicker>
                <mat-error *ngIf="eventoForm.get('fecha')?.hasError('required')">
                  La fecha es obligatoria
                </mat-error>
                <mat-error *ngIf="eventoForm.get('fecha')?.hasError('pastDate')">
                  La fecha no puede ser pasada
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Hora *</mat-label>
                <input matInput 
                       type="time"
                       formControlName="hora"
                       placeholder="20:00">
                <mat-icon matSuffix>access_time</mat-icon>
                <mat-error *ngIf="eventoForm.get('hora')?.hasError('required')">
                  La hora es obligatoria
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Capacidad Total *</mat-label>
                <input matInput 
                       type="number"
                       formControlName="capacidadTotal"
                       placeholder="300"
                       min="1"
                       max="10000">
                <mat-icon matSuffix>people</mat-icon>
                <mat-error *ngIf="eventoForm.get('capacidadTotal')?.hasError('required')">
                  La capacidad es obligatoria
                </mat-error>
                <mat-error *ngIf="eventoForm.get('capacidadTotal')?.hasError('min')">
                  Debe ser mayor a 0
                </mat-error>
                <mat-error *ngIf="eventoForm.get('capacidadTotal')?.hasError('max')">
                  No puede exceder 10,000
                </mat-error>
              </mat-form-field>
            </div>
          </div>

          <!-- Configuración de Entradas -->
          <div class="form-section" *ngIf="tiposEntradaDisponibles.length > 0">
            <h3 class="section-title">
              <mat-icon>confirmation_number</mat-icon>
              Configuración de Entradas
              <small>{{ getNombreTipoEvento() }}</small>
            </h3>

            <div class="entradas-grid">
              <mat-card *ngFor="let tipoEntrada of tiposEntradaDisponibles; let i = index" 
                        class="entrada-card"
                        [class.entrada-activa]="isEntradaActiva(tipoEntrada)">
                <mat-card-header>
                  <mat-card-title class="entrada-title">
                    <mat-icon>{{ getIconoTipoEntrada(tipoEntrada) }}</mat-icon>
                    {{ getNombreTipoEntrada(tipoEntrada) }}
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="entrada-form">
                    <mat-form-field appearance="outline" class="precio-field">
                      <mat-label>Precio ($)</mat-label>
                      <input matInput 
                             type="number"
                             [formControlName]="'precio_' + tipoEntrada"
                             placeholder="0"
                             min="0"
                             step="0.01">
                      <span matTextPrefix>$</span>
                      <mat-error>Precio requerido</mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="capacidad-field">
                      <mat-label>Capacidad</mat-label>
                      <input matInput 
                             type="number"
                             [formControlName]="'capacidad_' + tipoEntrada"
                             placeholder="0"
                             min="0"
                             [max]="eventoForm.get('capacidadTotal')?.value || 0">
                      <mat-error>Capacidad requerida</mat-error>
                    </mat-form-field>
                  </div>
                  
                  <div class="entrada-info">
                    <small>
                      Capacidad usada: {{ getCapacidadUsada() }} / {{ eventoForm.get('capacidadTotal')?.value || 0 }}
                    </small>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <div class="capacidad-warning" *ngIf="getCapacidadUsada() > (eventoForm.get('capacidadTotal')?.value || 0)">
              <mat-icon color="warn">warning</mat-icon>
              <span>La suma de capacidades individuales ({{ getCapacidadUsada() }}) excede la capacidad total ({{ eventoForm.get('capacidadTotal')?.value }})</span>
            </div>
          </div>

          <!-- Estado del formulario -->
          <div class="form-status" *ngIf="loading || eventoForm.invalid">
            <div class="status-item" *ngIf="loading">
              <mat-spinner diameter="20"></mat-spinner>
              <span>{{ data.isEdit ? 'Actualizando...' : 'Guardando...' }}</span>
            </div>
            
            <div class="validation-summary" *ngIf="eventoForm.invalid && eventoForm.touched">
              <mat-icon color="warn">warning</mat-icon>
              <span>Por favor corrija los errores marcados</span>
            </div>
          </div>

        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="form-actions">
        <button mat-button 
                type="button" 
                (click)="onCancel()"
                [disabled]="loading"
                class="cancel-button">
          <mat-icon>close</mat-icon>
          Cancelar
        </button>
        
        <button mat-raised-button 
                color="primary"
                type="submit"
                (click)="onSubmit()"
                [disabled]="eventoForm.invalid || loading || isCapacidadExcedida()"
                class="submit-button">
          <mat-icon>{{ data.isEdit ? 'save' : 'add' }}</mat-icon>
          {{ data.isEdit ? 'Actualizar' : 'Crear' }} Evento
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .evento-form-container {
      width: 100%;
      max-width: 800px;
    }

    .form-title {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #000;
      margin-bottom: 24px;
      font-size: 1.5rem;
      font-weight: 500;
    }

    .form-content {
      padding: 0 24px;
      max-height: 80vh;
      overflow-y: auto;
    }

    .evento-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #e0e0e0;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 20px 0;
      color: #333;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .section-title small {
      margin-left: auto;
      color: #666;
      font-size: 0.9rem;
      font-weight: 400;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-field {
      flex: 1;
      min-width: 200px;
    }

    .form-field.full-width {
      flex: 1 1 100%;
    }

    .entradas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .entrada-card {
      border: 2px solid #f0f0f0;
      transition: all 0.2s ease;
    }

    .entrada-card.entrada-activa {
      border-color: #000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .entrada-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1rem;
      margin: 0;
    }

    .entrada-form {
      display: flex;
      gap: 12px;
      margin-bottom: 8px;
    }

    .precio-field,
    .capacidad-field {
      flex: 1;
    }

    .entrada-info {
      padding: 8px;
      background: #f8f9fa;
      border-radius: 4px;
      text-align: center;
    }

    .capacidad-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #fff3e0;
      border-radius: 8px;
      color: #f57c00;
      border-left: 4px solid #ff9800;
    }

    .form-status {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #e0e0e0;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #666;
    }

    .validation-summary {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #d32f2f;
    }

    .form-actions {
      padding: 16px 24px;
      background: #fafafa;
      justify-content: space-between;
      border-top: 1px solid #e0e0e0;
    }

    .cancel-button {
      color: #666;
    }

    .submit-button {
      background: #000;
      color: white;
    }

    .submit-button:disabled {
      background: #ccc !important;
      color: #999 !important;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 12px;
      }
      
      .form-field {
        min-width: unset;
      }
      
      .evento-form-container {
        max-width: 100%;
      }

      .entradas-grid {
        grid-template-columns: 1fr;
      }

      .entrada-form {
        flex-direction: column;
      }
    }

    /* Animaciones */
    .form-section {
      transition: all 0.2s ease;
    }

    .entrada-card:hover {
      transform: translateY(-2px);
    }

    .submit-button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
  `]
})
export class EventoFormComponent implements OnInit {
  eventoForm: FormGroup;
  loading = false;
  tiposEntradaDisponibles: TipoEntrada[] = [];

  // Mapeos para UI
  tiposEventoNombres = {
    [TipoEvento.OBRA_TEATRO]: 'Obra de Teatro',
    [TipoEvento.RECITAL]: 'Recital',
    [TipoEvento.CHARLA_CONFERENCIA]: 'Charla/Conferencia'
  };

  tiposEntradaNombres = {
    // Teatro
    [TipoEntrada.GENERAL]: 'General',
    [TipoEntrada.VIP]: 'VIP',
    // Recital
    [TipoEntrada.CAMPO]: 'Campo',
    [TipoEntrada.PLATEA]: 'Platea',
    [TipoEntrada.PALCO]: 'Palco',
    // Charla
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
    private fb: FormBuilder,
    private eventoService: EventoService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EventoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EventoFormData
  ) {
    this.eventoForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.data.isEdit && this.data.evento) {
      this.loadEventoData();
    }
  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      descripcion: ['', [
        Validators.required,
        Validators.maxLength(500)
      ]],
      tipoEvento: ['', Validators.required],
      fecha: ['', [Validators.required, this.pastDateValidator]],
      hora: ['', Validators.required],
      capacidadTotal: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(10000)
      ]]
    });

    return form;
  }

  private pastDateValidator(control: any) {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate < today ? { pastDate: true } : null;
  }

  onTipoEventoChange(): void {
    const tipoEvento = this.eventoForm.get('tipoEvento')?.value;
    
    // Definir tipos de entrada según el evento
    switch (tipoEvento) {
      case TipoEvento.OBRA_TEATRO:
        this.tiposEntradaDisponibles = [TipoEntrada.GENERAL, TipoEntrada.VIP];
        break;
      case TipoEvento.RECITAL:
        this.tiposEntradaDisponibles = [TipoEntrada.CAMPO, TipoEntrada.PLATEA, TipoEntrada.PALCO];
        break;
      case TipoEvento.CHARLA_CONFERENCIA:
        this.tiposEntradaDisponibles = [TipoEntrada.CON_MEET_GREET, TipoEntrada.SIN_MEET_GREET];
        break;
      default:
        this.tiposEntradaDisponibles = [];
    }

    // Limpiar controles anteriores
    this.removeAllEntradaControls();
    
    // Agregar nuevos controles
    this.tiposEntradaDisponibles.forEach(tipo => {
      this.eventoForm.addControl(`precio_${tipo}`, 
        this.fb.control('', [Validators.required, Validators.min(0)]));
      this.eventoForm.addControl(`capacidad_${tipo}`, 
        this.fb.control('', [Validators.required, Validators.min(0)]));
    });
  }

  private removeAllEntradaControls(): void {
    Object.keys(this.eventoForm.controls).forEach(key => {
      if (key.startsWith('precio_') || key.startsWith('capacidad_')) {
        this.eventoForm.removeControl(key);
      }
    });
  }

  private loadEventoData(): void {
    const evento = this.data.evento!;
    
    // Cargar datos básicos
    this.eventoForm.patchValue({
      nombre: evento.nombre,
      descripcion: evento.descripcion,
      tipoEvento: evento.tipoEvento,
       fecha: this.extraerFecha(evento.fechaHora),
      hora: this.extraerHora(evento.fechaHora),
      capacidadTotal: evento.capacidadTotal
    });

    // Trigger para cargar tipos de entrada
    this.onTipoEventoChange();

    // Cargar precios y capacidades
    if (evento.precios && evento.capacidades) {
      Object.keys(evento.precios).forEach(tipoEntrada => {
        this.eventoForm.patchValue({
          [`precio_${tipoEntrada}`]: evento.precios![tipoEntrada],
          [`capacidad_${tipoEntrada}`]: evento.capacidades![tipoEntrada]
        });
      });
    }
  }

  onSubmit(): void {
    if (this.eventoForm.invalid || this.isCapacidadExcedida()) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    const formValue = this.eventoForm.value;
    
    const fechaHora = this.combinarFechaYHora(formValue.fecha, formValue.hora);

    // Construir configuración de entradas
    const configuracionEntradas: { [key: string]: ConfiguracionEntrada } = {};
    
    this.tiposEntradaDisponibles.forEach(tipo => {
      const precio = formValue[`precio_${tipo}`];
      const capacidad = formValue[`capacidad_${tipo}`];
      
      if (precio > 0 && capacidad > 0) {
        configuracionEntradas[tipo] = { precio, capacidad };
      }
    });

    const eventoData: EventoRequest = {
      nombre: formValue.nombre,
      descripcion: formValue.descripcion,
      fechaHora: this.formatearParaBackend(fechaHora),
      tipoEvento: formValue.tipoEvento,
      capacidadTotal: formValue.capacidadTotal,
      configuracionEntradas
    };

    const operation = this.data.isEdit ?
      this.eventoService.actualizarEvento(this.data.evento!.id!, eventoData) :
      this.eventoService.crearEvento(eventoData);

    operation.subscribe({
      next: (evento) => {
        this.loading = false;
        const mensaje = this.data.isEdit ? 
          'Evento actualizado exitosamente' : 
          'Evento creado exitosamente';
        
        this.snackBar.open(mensaje, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        this.dialogRef.close(evento);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al guardar evento:', error);
        
        let mensaje = 'Error al guardar el evento';
        if (error.status === 400) {
          mensaje = 'Datos inválidos. Verifique la información';
        }
        
        this.snackBar.open(mensaje, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private combinarFechaYHora(fecha: Date, hora: string): Date {
    const fechaSeleccionada = new Date(fecha);
    const [horas, minutos] = hora.split(':');
    
    // Crear fecha en zona horaria local para evitar problemas UTC
    return new Date(
      fechaSeleccionada.getFullYear(),
      fechaSeleccionada.getMonth(),
      fechaSeleccionada.getDate(),
      parseInt(horas),
      parseInt(minutos),
      0, // segundos
      0  // milisegundos
    );
  }

  private formatearParaBackend(fecha: Date): string {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  const hours = String(fecha.getHours()).padStart(2, '0');
  const minutes = String(fecha.getMinutes()).padStart(2, '0');
  const seconds = '00';
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  private extraerFecha(fechaHoraString: string): Date {
  // Si viene formato "2024-06-25T20:00:00"
  const fechaPartes = fechaHoraString.split('T')[0]; // "2024-06-25"
  const [year, month, day] = fechaPartes.split('-');
  
  // Crear fecha en zona local para evitar cambio de día
  return new Date(Number(year), Number(month) - 1, Number(day));
}

private extraerHora(fechaHoraString: string): string {
  // Si viene formato "2024-06-25T20:00:00"
  const horaPartes = fechaHoraString.split('T')[1]; // "20:00:00"
  return horaPartes.substring(0, 5); // "20:00"
}

  // Métodos de utilidad
  getNombreTipoEvento(): string {
    const tipo = this.eventoForm.get('tipoEvento')?.value as TipoEvento;
    return tipo ? this.tiposEventoNombres[tipo] : '';
  }

  getNombreTipoEntrada(tipo: TipoEntrada): string {
    return this.tiposEntradaNombres[tipo];
  }

  getIconoTipoEntrada(tipo: TipoEntrada): string {
    return this.tiposEntradaIconos[tipo];
  }

  isEntradaActiva(tipo: TipoEntrada): boolean {
    const precio = this.eventoForm.get(`precio_${tipo}`)?.value;
    const capacidad = this.eventoForm.get(`capacidad_${tipo}`)?.value;
    return precio > 0 && capacidad > 0;
  }

  getCapacidadUsada(): number {
    return this.tiposEntradaDisponibles.reduce((total, tipo) => {
      const capacidad = this.eventoForm.get(`capacidad_${tipo}`)?.value || 0;
      return total + capacidad;
    }, 0);
  }

  isCapacidadExcedida(): boolean {
    const capacidadTotal = this.eventoForm.get('capacidadTotal')?.value || 0;
    return this.getCapacidadUsada() > capacidadTotal;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.eventoForm.controls).forEach(key => {
      const control = this.eventoForm.get(key);
      control?.markAsTouched();
    });
  }
}
