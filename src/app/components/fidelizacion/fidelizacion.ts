import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  FidelizacionService, 
  EstadisticasFidelizacion, 
  ReporteMensual,
  EstadisticasDetalladasCliente 
} from '../../services/fidelizacion';
import { Cliente, ClienteResumen } from '../../models/cliente';

@Component({
  selector: 'app-fidelizacion',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="fidelizacion-container">
  <!-- Header con navegación -->
  <div class="header-section">
    <h1 class="page-title">
      🎭 Sistema de Fidelización
    </h1>
    
    <nav class="tab-navigation">
      <button 
        class="tab-btn" 
        [class.active]="activeView === 'dashboard'"
        (click)="changeView('dashboard')">
        📊 Dashboard
      </button>
      <button 
        class="tab-btn" 
        [class.active]="activeView === 'ranking'"
        (click)="changeView('ranking')">
        🏆 Ranking
      </button>
      <button 
        class="tab-btn" 
        [class.active]="activeView === 'cliente'"
        (click)="changeView('cliente')">
        👤 Cliente
      </button>
    </nav>
  </div>

  <!-- Loading State -->
  <div *ngIf="loading" class="loading-state">
    <div class="spinner"></div>
    <p>Cargando datos de fidelización...</p>
  </div>

  <!-- Error State -->
  <div *ngIf="error" class="error-state">
    <p>{{ error }}</p>
    <button (click)="cargarDatosPrincipales()" class="retry-btn">Reintentar</button>
  </div>

  <!-- Dashboard View -->
  <div *ngIf="activeView === 'dashboard' && !loading && estadisticas" class="dashboard-view">
    <!-- Estadísticas principales -->
    <div class="stats-grid">
      <div class="stat-card primary">
        <div class="stat-value">{{ estadisticas.totalClientes }}</div>
        <div class="stat-label">Total Clientes</div>
      </div>
      
      <div class="stat-card success">
        <div class="stat-value">{{ estadisticas.clientesFrecuentes }}</div>
        <div class="stat-label">Clientes Frecuentes</div>
      </div>
      
      <div class="stat-card warning">
        <div class="stat-value">{{ estadisticas.clientesConPasesDisponibles }}</div>
        <div class="stat-label">Con Pases Disponibles</div>
      </div>
      
      <div class="stat-card info">
        <div class="stat-value">{{ estadisticas.totalPasesOtorgados }}</div>
        <div class="stat-label">Pases Otorgados</div>
      </div>
    </div>

    <!-- Métricas adicionales -->
    <div class="metrics-section">
      <div class="metric-card">
        <h3>Porcentaje de Fidelización</h3>
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="estadisticas.porcentajeFidelizacion"></div>
        </div>
        <span class="progress-text">{{ estadisticas.porcentajeFidelizacion }}%</span>
      </div>
      
      <div class="metric-card">
        <h3>Promedio de Eventos por Cliente</h3>
        <div class="metric-value">{{ estadisticas.promedioEventosPorCliente | number:'1.1-1' }}</div>
      </div>
    </div>

    <!-- Acciones administrativas -->
    <div class="admin-actions">
      <button (click)="actualizarSistema()" class="btn-admin primary">
        🔄 Actualizar Sistema
      </button>
      <button (click)="validarIntegridad()" class="btn-admin secondary">
        ✅ Validar Integridad
      </button>
      <button (click)="exportarDatos()" class="btn-admin info">
        📁 Exportar Datos
      </button>
    </div>
  </div>

  <!-- Ranking View -->
  <div *ngIf="activeView === 'ranking' && !loading" class="ranking-view">
    <h2>🏆 Ranking de Clientes Frecuentes</h2>
    
    <div class="ranking-list">
      <div *ngFor="let cliente of rankingClientes; let i = index" class="ranking-item">
        <div class="ranking-position">
          <span class="position-number">#{{ i + 1 }}</span>
          <span class="position-icon">{{ getIconoNivelSafe(cliente) }}</span>
        </div>
        
        <div class="cliente-info">
          <h4>{{ cliente.nombre }} {{ cliente.apellido }}</h4>
          <p>{{ cliente.email }}</p>
        </div>
        
        <div class="cliente-stats">
          <div class="stat">
            <span class="stat-number">{{ getEventosAsistidosSafe(cliente) }}</span>
            <span class="stat-text">Eventos</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ getPasesGratuitosSafe(cliente) }}</span>
            <span class="stat-text">Pases</span>
          </div>
        </div>
        
        <div class="nivel-badge" [style.background-color]="getColorNivelSafe(cliente)">
          {{ getNivelClienteSafe(cliente) }}
        </div>
      </div>
    </div>
  </div>

  

  <!-- Cliente View -->
  <div *ngIf="activeView === 'cliente' && !loading" class="cliente-view">
    <h2>👤 Detalles de Cliente</h2>
    
    <div class="selector-cliente">
      <select [(ngModel)]="selectedClienteId" (change)="cargarEstadisticasCliente(selectedClienteId!)">
        <option value="">Seleccionar cliente...</option>
        <option *ngFor="let cliente of rankingClientes" [value]="cliente.id">
          {{ cliente.nombre }} {{ cliente.apellido }}
        </option>
      </select>
    </div>
    
    <div *ngIf="estadisticasCliente" class="cliente-details">
      <div class="progreso-fidelizacion">
        <h3>Progreso hacia próximo pase gratuito</h3>
        <div class="progress-circle">
          <div class="progress-text">
            {{ estadisticasCliente.eventosParaProximoPase || 0 }} eventos restantes
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" 
               [style.width.%]="getProgresoPorcentajeSafe(estadisticasCliente.eventosAsistidos)">
          </div>
        </div>
      </div>
      
      <div class="cliente-stats-detail">
        <div class="stat-detail">
          <span>Eventos Asistidos:</span>
          <strong>{{ estadisticasCliente.eventosAsistidos || 0 }}</strong>
        </div>
        <div class="stat-detail">
          <span>Pases Disponibles:</span>
          <strong>{{ estadisticasCliente.pasesGratuitosDisponibles || 0 }}</strong>
        </div>
        <div class="stat-detail">
          <span>Asistencias este año:</span>
          <strong>{{ estadisticasCliente.asistenciasEsteAno || 0 }}</strong>
        </div>
        <div class="stat-detail">
          <span>Meses como cliente:</span>
          <strong>{{ estadisticasCliente.mesesComoCliente || 0 }}</strong>
        </div>
      </div>
    </div>
  </div>
</div>`,
  styles: [`
    .fidelizacion-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header-section {
      margin-bottom: 30px;
    }
    
    .page-title {
      font-size: 2.5rem;
      font-weight: bold;
      color: #2c3e50;
      margin: 0 0 20px 0;
      text-align: center;
    }
    
    .tab-navigation {
      display: flex;
      gap: 10px;
      border-bottom: 2px solid #ecf0f1;
      padding-bottom: 10px;
    }
    
    .tab-btn {
      padding: 12px 24px;
      border: none;
      background: #f8f9fa;
      color: #6c757d;
      border-radius: 8px 8px 0 0;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .tab-btn:hover {
      background: #e9ecef;
      color: #495057;
    }
    
    .tab-btn.active {
      background: #007bff;
      color: white;
      box-shadow: 0 2px 4px rgba(0,123,255,0.3);
    }
    
    .loading-state, .error-state {
      text-align: center;
      padding: 60px 20px;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .stat-card {
      background: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      text-align: center;
      border-left: 5px solid;
    }
    
    .stat-card.primary { border-left-color: #007bff; }
    .stat-card.success { border-left-color: #28a745; }
    .stat-card.warning { border-left-color: #ffc107; }
    .stat-card.info { border-left-color: #17a2b8; }
    
    .stat-value {
      font-size: 3rem;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 10px;
    }
    
    .stat-label {
      font-size: 1rem;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  `],
  styleUrls: ['./fidelizacion.css']
})
export class FidelizacionComponent implements OnInit {
  // Datos principales
  estadisticas: EstadisticasFidelizacion | null = null;
  rankingClientes: Cliente[] = [];
  clientesElegibles: ClienteResumen[] = [];
  reporteMensual: ReporteMensual | null = null;
  
  // Estados de carga
  loading = false;
  error: string | null = null;
  
  // Filtros y selecciones
  selectedClienteId: number | null = null;
  estadisticasCliente: EstadisticasDetalladasCliente | null = null;
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  
  // Vista activa
  activeView: 'dashboard' | 'ranking' | 'reportes' | 'cliente' = 'dashboard';

  constructor(private fidelizacionService: FidelizacionService) {}

  ngOnInit(): void {
    this.cargarDatosPrincipales();
  }

  async cargarDatosPrincipales(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // Cargar múltiples datos en paralelo
      const [estadisticas, ranking, elegibles] = await Promise.all([
        this.fidelizacionService.obtenerEstadisticasFidelizacion().toPromise(),
        this.fidelizacionService.obtenerRankingClientesFrecuentes().toPromise(),
        this.fidelizacionService.obtenerClientesElegiblesParaPase().toPromise()
      ]);

      this.estadisticas = estadisticas!;
      this.rankingClientes = ranking!;
      this.clientesElegibles = elegibles!;

    } catch (error) {
      console.error('Error cargando datos de fidelización:', error);
      this.error = 'Error al cargar los datos de fidelización';
    } finally {
      this.loading = false;
    }
  }

  async cargarReporteMensual(): Promise<void> {
    try {
      this.reporteMensual = await this.fidelizacionService
        .obtenerReporteMensual(this.selectedYear, this.selectedMonth)
        .toPromise() || null;
    } catch (error) {
      console.error('Error cargando reporte mensual:', error);
    }
  }

  async cargarEstadisticasCliente(clienteId: number): Promise<void> {
    this.selectedClienteId = clienteId;
    try {
      this.estadisticasCliente = await this.fidelizacionService
        .obtenerEstadisticasDetalladasCliente(clienteId)
        .toPromise() || null;
    } catch (error) {
      console.error('Error cargando estadísticas del cliente:', error);
    }
  }

  // ✅ Métodos de utilidad seguros
  getEventosAsistidosSafe(cliente: any): number {
    return cliente?.eventosAsistidos || 0;
  }

  getPasesGratuitosSafe(cliente: any): number {
    return cliente?.pasesGratuitos || 0;
  }

  getNivelCliente(eventosAsistidos: number): string {
    return this.fidelizacionService.calcularNivelFidelizacion(eventosAsistidos);
  }

  getNivelClienteSafe(cliente: any): string {
    return this.getNivelCliente(this.getEventosAsistidosSafe(cliente));
  }

  getColorNivel(nivel: string): string {
    return this.fidelizacionService.obtenerColorNivel(nivel);
  }

  getColorNivelSafe(cliente: any): string {
    return this.getColorNivel(this.getNivelClienteSafe(cliente));
  }

  getIconoNivel(nivel: string): string {
    return this.fidelizacionService.obtenerIconoNivel(nivel);
  }

  getIconoNivelSafe(cliente: any): string {
    return this.getIconoNivel(this.getNivelClienteSafe(cliente));
  }

  getProgresoPorcentaje(eventosAsistidos: number): number {
    return this.fidelizacionService.calcularProgresoPorcentaje(eventosAsistidos);
  }

  getProgresoPorcentajeSafe(eventosAsistidos: number | undefined): number {
    return this.getProgresoPorcentaje(eventosAsistidos || 0);
  }

  getEventosFaltantes(eventosAsistidos: number): number {
    return this.fidelizacionService.calcularEventosFaltantes(eventosAsistidos);
  }

  // Acciones administrativas
  async actualizarSistema(): Promise<void> {
    this.loading = true;
    try {
      await this.fidelizacionService.actualizarSistemaFidelizacion().toPromise();
      await this.cargarDatosPrincipales();
      alert('Sistema de fidelización actualizado correctamente');
    } catch (error) {
      console.error('Error actualizando sistema:', error);
      alert('Error al actualizar el sistema');
    } finally {
      this.loading = false;
    }
  }

  async validarIntegridad(): Promise<void> {
    try {
      const resultado = await this.fidelizacionService.validarIntegridadSistema().toPromise();
      alert(`Validación completada: ${JSON.stringify(resultado)}`);
    } catch (error) {
      console.error('Error validando integridad:', error);
      alert('Error en la validación');
    }
  }

  async exportarDatos(): Promise<void> {
    try {
      const datos = await this.fidelizacionService.exportarDatosFidelizacion().toPromise();
      // Crear descarga de archivo
      const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fidelizacion_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exportando datos:', error);
      alert('Error al exportar datos');
    }
  }

  // Navegación entre vistas
  changeView(view: 'dashboard' | 'ranking' | 'reportes' | 'cliente'): void {
    this.activeView = view;
    if (view === 'reportes' && !this.reporteMensual) {
      this.cargarReporteMensual();
    }
  }
}