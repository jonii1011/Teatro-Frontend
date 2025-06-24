import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';

import { ClienteService } from '../../../services/cliente';
import { Cliente, ClienteRequest } from '../../../models/cliente';

export interface ClienteFormData {
  cliente?: Cliente;
  isEdit: boolean;
}

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  providers: [provideNativeDateAdapter()], // ← Agregar esto
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
    MatNativeDateModule
  ],
  template: `
    <div class="cliente-form-container">
      <h2 mat-dialog-title class="form-title">
        <mat-icon>{{ data.isEdit ? 'edit' : 'person_add' }}</mat-icon>
        {{ data.isEdit ? 'Editar Cliente' : 'Nuevo Cliente' }}
      </h2>

      <mat-dialog-content class="form-content">
        <form [formGroup]="clienteForm" class="cliente-form">
          
          <!-- Información Personal -->
          <div class="form-section">
            <h3 class="section-title">
              <mat-icon>person</mat-icon>
              Información Personal
            </h3>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Nombre *</mat-label>
                <input matInput 
                       formControlName="nombre" 
                       placeholder="Ingrese el nombre"
                       maxlength="50">
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="clienteForm.get('nombre')?.hasError('required')">
                  El nombre es obligatorio
                </mat-error>
                <mat-error *ngIf="clienteForm.get('nombre')?.hasError('minlength')">
                  El nombre debe tener al menos 2 caracteres
                </mat-error>
                <mat-error *ngIf="clienteForm.get('nombre')?.hasError('pattern')">
                  Solo se permiten letras y espacios
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Apellido *</mat-label>
                <input matInput 
                       formControlName="apellido" 
                       placeholder="Ingrese el apellido"
                       maxlength="50">
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="clienteForm.get('apellido')?.hasError('required')">
                  El apellido es obligatorio
                </mat-error>
                <mat-error *ngIf="clienteForm.get('apellido')?.hasError('minlength')">
                  El apellido debe tener al menos 2 caracteres
                </mat-error>
                <mat-error *ngIf="clienteForm.get('apellido')?.hasError('pattern')">
                  Solo se permiten letras y espacios
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Email *</mat-label>
                <input matInput 
                       formControlName="email" 
                       type="email"
                       placeholder="ejemplo@correo.com"
                       maxlength="100">
                <mat-icon matSuffix>email</mat-icon>
                <mat-error *ngIf="clienteForm.get('email')?.hasError('required')">
                  El email es obligatorio
                </mat-error>
                <mat-error *ngIf="clienteForm.get('email')?.hasError('email')">
                  Ingrese un email válido
                </mat-error>
                <mat-error *ngIf="clienteForm.get('email')?.hasError('emailExists')">
                  Este email ya está registrado
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>DNI *</mat-label>
                <input matInput 
                       formControlName="dni" 
                       placeholder="12345678"
                       maxlength="10">
                <mat-icon matSuffix>badge</mat-icon>
                <mat-error *ngIf="clienteForm.get('dni')?.hasError('required')">
                  El DNI es obligatorio
                </mat-error>
                <mat-error *ngIf="clienteForm.get('dni')?.hasError('pattern')">
                  Solo se permiten números
                </mat-error>
                <mat-error *ngIf="clienteForm.get('dni')?.hasError('minlength') || clienteForm.get('dni')?.hasError('maxlength')">
                  El DNI debe tener entre 7 y 8 dígitos
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Teléfono</mat-label>
                <input matInput 
                       formControlName="telefono" 
                       placeholder="Ej: +54 9 11 1234-5678"
                       maxlength="20">
                <mat-icon matSuffix>phone</mat-icon>
                <mat-error *ngIf="clienteForm.get('telefono')?.hasError('pattern')">
                  Formato de teléfono inválido
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Fecha de Nacimiento *</mat-label>
                <input matInput 
                       [matDatepicker]="picker" 
                       formControlName="fechaNacimiento"
                       placeholder="Seleccione una fecha"
                       readonly>
                <mat-datepicker-toggle matSuffix [for]="picker">
                  <mat-icon matDatepickerToggleIcon>calendar_today</mat-icon>
                </mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="clienteForm.get('fechaNacimiento')?.hasError('required')">
                  La fecha de nacimiento es obligatoria
                </mat-error>
                <mat-error *ngIf="clienteForm.get('fechaNacimiento')?.hasError('futureDate')">
                  La fecha no puede ser futura
                </mat-error>
              </mat-form-field>
            </div>
          </div>

          <!-- Estado del formulario -->
          <div class="form-status" *ngIf="loading || clienteForm.invalid">
            <div class="status-item" *ngIf="loading">
              <mat-spinner diameter="20"></mat-spinner>
              <span>{{ data.isEdit ? 'Actualizando...' : 'Guardando...' }}</span>
            </div>
            
            <div class="validation-summary" *ngIf="clienteForm.invalid && clienteForm.touched">
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
                [disabled]="clienteForm.invalid || loading"
                class="submit-button">
          <mat-icon>{{ data.isEdit ? 'save' : 'add' }}</mat-icon>
          {{ data.isEdit ? 'Actualizar' : 'Crear' }} Cliente
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .cliente-form-container {
      width: 100%;
      max-width: 600px;
    }

    .form-title {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #1976d2;
      margin-bottom: 20px;
      font-size: 1.5em;
    }

    .form-content {
      padding: 0 24px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .cliente-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-section {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      border-left: 4px solid #1976d2;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 20px 0;
      color: #1976d2;
      font-size: 1.1em;
      font-weight: 500;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 10px;
    }

    .form-field {
      flex: 1;
      min-width: 200px;
    }

    .form-field.full-width {
      flex: 1 1 100%;
    }

    .form-status {
      background: #fff3e0;
      border-radius: 8px;
      padding: 16px;
      border-left: 4px solid #ff9800;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #f57c00;
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
    }

    .cancel-button {
      color: #666;
    }

    .submit-button {
      background: linear-gradient(45deg, #1976d2, #42a5f5);
      color: white;
    }

    .submit-button:disabled {
      background: #ccc !important;
      color: #999 !important;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .form-row {
        flex-direction: column;
        gap: 10px;
      }
      
      .form-field {
        min-width: unset;
      }
      
      .cliente-form-container {
        max-width: 100%;
      }
    }

    /* Animaciones */
    .form-section {
      transition: all 0.3s ease;
    }

    .form-section:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .form-field {
      transition: all 0.2s ease;
    }

    .submit-button {
      transition: all 0.3s ease;
    }

    .submit-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
    }
  `]
})
export class ClienteFormComponent implements OnInit {
  clienteForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ClienteFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClienteFormData
  ) {
    this.clienteForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.data.isEdit && this.data.cliente) {
      this.loadClienteData();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      apellido: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ], [this.emailExistsValidator.bind(this)]],
      dni: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]+$/),
        Validators.minLength(7),
        Validators.maxLength(8)
      ]],
      telefono: ['', [
        Validators.pattern(/^[\+]?[0-9\s\-\(\)]+$/)
      ]],
      fechaNacimiento: ['', [
        Validators.required,
        this.futureDateValidator
      ]]
    });
  }

  private loadClienteData(): void {
    const cliente = this.data.cliente!;
    this.clienteForm.patchValue({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      email: cliente.email,
      dni: cliente.dni,
      telefono: cliente.telefono || '',
      fechaNacimiento: cliente.fechaNacimiento ? new Date(cliente.fechaNacimiento + 'T00:00:00') : ''
    });
  }

  // Validador personalizado para fechas futuras
  private futureDateValidator(control: any) {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate > today ? { futureDate: true } : null;
  }

  // Validador asíncrono para email existente
  private emailExistsValidator(control: any) {
    if (!control.value || this.data.isEdit) {
      return Promise.resolve(null);
    }

    return this.clienteService.existeEmail(control.value)
      .toPromise()
      .then(exists => exists ? { emailExists: true } : null)
      .catch(() => null);
  }

  onSubmit(): void {
    if (this.clienteForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    const formValue = this.clienteForm.value;

    const clienteData: ClienteRequest = {
      ...formValue,
      fechaNacimiento: formValue.fechaNacimiento ? 
        this.formatDate(formValue.fechaNacimiento) : ''
    };
    
    const operation = this.data.isEdit ?
      this.clienteService.actualizarCliente(this.data.cliente!.id!, clienteData) :
      this.clienteService.crearCliente(clienteData);

    operation.subscribe({
      next: (cliente) => {
        this.loading = false;
        const mensaje = this.data.isEdit ? 
          'Cliente actualizado exitosamente' : 
          'Cliente creado exitosamente';
        
        this.snackBar.open(mensaje, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        this.dialogRef.close(cliente);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al guardar cliente:', error);
        
        let mensaje = 'Error al guardar el cliente';
        if (error.status === 409) {
          mensaje = 'El email o DNI ya están registrados';
        } else if (error.status === 400) {
          mensaje = 'Datos inválidos. Verifique la información';
        }
        
        this.snackBar.open(mensaje, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private formatDate(date: Date): string {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.clienteForm.controls).forEach(key => {
      const control = this.clienteForm.get(key);
      control?.markAsTouched();
    });
  }
}