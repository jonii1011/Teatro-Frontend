// src/app/services/fidelizacion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente, ClienteResumen } from '../models/cliente';

export interface EstadisticasFidelizacion {
  totalClientes: number;
  clientesFrecuentes: number;
  clientesConPasesDisponibles: number;
  totalPasesOtorgados: number;
  totalPasesUsados: number;
  promedioEventosPorCliente: number;
  porcentajeFidelizacion: number;
}

export interface EstadisticasDetalladasCliente {
  eventosAsistidos: number;
  pasesGratuitosDisponibles: number;
  esClienteFrecuente: boolean;
  eventosParaProximoPase: number;
  asistenciasEsteAno: number;
  fechaRegistro: string;
  mesesComoCliente: number;
}

export interface ReporteMensual {
  ano: number;
  mes: number;
  estadisticas: EstadisticasFidelizacion;
  totalClientesFrecuentes: number;
  topClientesFrecuentes: Cliente[];
}

@Injectable({
  providedIn: 'root'
})
export class FidelizacionService {
  private apiUrl = 'http://localhost:8080/api/fidelizacion';

  constructor(private http: HttpClient) { }

  // Consultas de fidelización
  contarAsistenciasEnAnoActual(clienteId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/asistencias-ano-actual/${clienteId}`);
  }

  calcularPasesGratuitosPendientes(clienteId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/pases-pendientes/${clienteId}`);
  }

  obtenerClientesElegiblesParaPase(): Observable<ClienteResumen[]> {
    return this.http.get<ClienteResumen[]>(`${this.apiUrl}/clientes-elegibles`);
  }

  // Estadísticas de fidelización
  obtenerEstadisticasFidelizacion(): Observable<EstadisticasFidelizacion> {
    return this.http.get<EstadisticasFidelizacion>(`${this.apiUrl}/estadisticas`);
  }

  obtenerRankingClientesFrecuentes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/ranking-clientes-frecuentes`);
  }

  obtenerEstadisticasDetalladasCliente(clienteId: number): Observable<EstadisticasDetalladasCliente> {
    return this.http.get<EstadisticasDetalladasCliente>(`${this.apiUrl}/estadisticas-cliente/${clienteId}`);
  }

  // Reportes avanzados
  obtenerReporteMensual(ano?: number, mes?: number): Observable<ReporteMensual> {
    let params = '';
    if (ano && mes) {
      params = `?ano=${ano}&mes=${mes}`;
    } else if (ano) {
      params = `?ano=${ano}`;
    } else if (mes) {
      params = `?mes=${mes}`;
    }
    return this.http.get<ReporteMensual>(`${this.apiUrl}/reporte-mensual${params}`);
  }

  exportarDatosFidelizacion(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/exportar`);
  }

  // Métodos administrativos
  actualizarSistemaFidelizacion(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/actualizar-sistema`, {});
  }

  validarIntegridadSistema(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/validar-integridad`);
  }

  // Métodos de utilidad para el frontend
  calcularNivelFidelizacion(eventosAsistidos: number): string {
    if (eventosAsistidos >= 20) {
      return 'GOLD';
    } else if (eventosAsistidos >= 10) {
      return 'SILVER';
    } else if (eventosAsistidos >= 5) {
      return 'BRONZE';
    } else {
      return 'NUEVO';
    }
  }

  calcularProgresoPorcentaje(eventosAsistidos: number): number {
    return (eventosAsistidos % 5) * 20; // Cada evento = 20% hacia el próximo pase
  }

  calcularEventosFaltantes(eventosAsistidos: number): number {
    return 5 - (eventosAsistidos % 5);
  }

  obtenerColorNivel(nivel: string): string {
    switch (nivel) {
      case 'GOLD': return '#FFD700';
      case 'SILVER': return '#C0C0C0';
      case 'BRONZE': return '#CD7F32';
      default: return '#9E9E9E';
    }
  }

  obtenerIconoNivel(nivel: string): string {
    switch (nivel) {
      case 'GOLD': return '🏆';
      case 'SILVER': return '🥈';
      case 'BRONZE': return '🥉';
      default: return '⭐';
    }
  }
}