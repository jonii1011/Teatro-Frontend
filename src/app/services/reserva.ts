// src/app/services/reserva.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva, ReservaRequest, ReservaResumen, EstadoReserva } from '../models/reserva';
import { TipoEntrada } from '../models/evento';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = 'http://localhost:8080/api/reservas';

  constructor(private http: HttpClient) { }

  // CRUD básico
  crearReserva(reserva: ReservaRequest): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, reserva);
  }

  obtenerReserva(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.apiUrl}/${id}`);
  }

  obtenerTodasLasReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.apiUrl);
  }

  eliminarReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Búsquedas
  obtenerReservasPorCliente(clienteId: number): Observable<ReservaResumen[]> {
    return this.http.get<ReservaResumen[]>(`${this.apiUrl}/cliente/${clienteId}`);
  }

  obtenerReservasPorEvento(eventoId: number): Observable<ReservaResumen[]> {
    return this.http.get<ReservaResumen[]>(`${this.apiUrl}/evento/${eventoId}`);
  }

  obtenerReservaPorCodigo(codigo: string): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.apiUrl}/codigo/${codigo}`);
  }

  obtenerReservasPorEstado(estado: EstadoReserva): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/estado/${estado}`);
  }

  // Gestión de estados
  confirmarReserva(id: number): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/${id}/confirmar`, {});
  }

  cancelarReserva(id: number, motivo: string): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/${id}/cancelar?motivo=${encodeURIComponent(motivo)}`, {});
  }

  marcarAsistencia(id: number): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/${id}/marcar-asistencia`, {});
  }

  marcarNoAsistencia(id: number): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/${id}/marcar-no-asistencia`, {});
  }

  // Pases gratuitos
  crearReservaConPaseGratuito(clienteId: number, eventoId: number, tipoEntrada: TipoEntrada): Observable<Reserva> {
    const params = `clienteId=${clienteId}&eventoId=${eventoId}&tipoEntrada=${tipoEntrada}`;
    return this.http.post<Reserva>(`${this.apiUrl}/con-pase-gratuito?${params}`, {});
  }

  // Consultas específicas
  obtenerReservasConfirmadas(clienteId: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/cliente/${clienteId}/confirmadas`);
  }

  obtenerReservasPendientesVencidas(horas: number = 24): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/pendientes-vencidas?horasVencimiento=${horas}`);
  }

  obtenerReservasQueExpiranPronto(horas: number = 24): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/expiran-pronto?horasAntes=${horas}`);
  }

  // Validaciones
  puedeCrearReserva(clienteId: number, eventoId: number, tipoEntrada: TipoEntrada): Observable<boolean> {
    const params = `clienteId=${clienteId}&eventoId=${eventoId}&tipoEntrada=${tipoEntrada}`;
    return this.http.get<boolean>(`${this.apiUrl}/puede-crear?${params}`);
  }

  validarReservaCancelable(id: number): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/${id}/validar-cancelable`);
  }

  validarReservaConfirmable(id: number): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/${id}/validar-confirmable`);
  }

  // Estadísticas
  calcularIngresosPorEvento(eventoId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/evento/${eventoId}/ingresos`);
  }

  contarReservasConfirmadasPorEventoYTipo(eventoId: number, tipoEntrada: TipoEntrada): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/evento/${eventoId}/contar/${tipoEntrada}`);
  }

  // Operaciones combinadas
  crearYConfirmarReserva(reserva: ReservaRequest): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.apiUrl}/crear-y-confirmar`, reserva);
  }

  // Utilidades
  obtenerEstadosReserva(): Observable<EstadoReserva[]> {
    return this.http.get<EstadoReserva[]>(`${this.apiUrl}/estados`);
  }

  obtenerResumenReserva(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/resumen`);
  }
}
