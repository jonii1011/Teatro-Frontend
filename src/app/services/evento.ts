// src/app/services/evento.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evento, EventoRequest, EventoResumen, TipoEvento, TipoEntrada } from '../models/evento';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private apiUrl = 'http://localhost:8080/api/eventos';

  constructor(private http: HttpClient) { }

  // CRUD básico
  crearEvento(evento: EventoRequest): Observable<Evento> {
    return this.http.post<Evento>(this.apiUrl, evento);
  }

  obtenerEvento(id: number): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/${id}`);
  }

  obtenerTodosLosEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.apiUrl);
  }

  obtenerEventosVigentes(): Observable<EventoResumen[]> {
    return this.http.get<EventoResumen[]>(`${this.apiUrl}/vigentes`);
  }

  actualizarEvento(id: number, evento: EventoRequest): Observable<Evento> {
    return this.http.put<Evento>(`${this.apiUrl}/${id}`, evento);
  }

  eliminarEvento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Consultas específicas
  obtenerEventosPorTipo(tipo: TipoEvento): Observable<EventoResumen[]> {
    return this.http.get<EventoResumen[]>(`${this.apiUrl}/tipo/${tipo}`);
  }

  buscarEventosPorNombre(nombre: string): Observable<EventoResumen[]> {
    return this.http.get<EventoResumen[]>(`${this.apiUrl}/buscar?nombre=${nombre}`);
  }

  obtenerEventosConDisponibilidad(): Observable<EventoResumen[]> {
    return this.http.get<EventoResumen[]>(`${this.apiUrl}/con-disponibilidad`);
  }

  obtenerEventosProximos(dias: number = 7): Observable<EventoResumen[]> {
    return this.http.get<EventoResumen[]>(`${this.apiUrl}/proximos?dias=${dias}`);
  }

  // Disponibilidad
  tieneDisponibilidad(eventoId: number, tipoEntrada: TipoEntrada): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${eventoId}/disponibilidad/${tipoEntrada}`);
  }

  obtenerCapacidadDisponible(eventoId: number, tipoEntrada: TipoEntrada): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${eventoId}/capacidad-disponible/${tipoEntrada}`);
  }

  obtenerDisponibilidadPorTipo(eventoId: number): Observable<{[key: string]: number}> {
    return this.http.get<{[key: string]: number}>(`${this.apiUrl}/${eventoId}/disponibilidad-por-tipo`);
  }

  // Precios
  obtenerPrecioEntrada(eventoId: number, tipoEntrada: TipoEntrada): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${eventoId}/precio/${tipoEntrada}`);
  }

  obtenerTodosLosPrecios(eventoId: number): Observable<{[key: string]: number}> {
    return this.http.get<{[key: string]: number}>(`${this.apiUrl}/${eventoId}/precios`);
  }

  // Información completa
  obtenerInfoCompleta(eventoId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${eventoId}/info-completa`);
  }

  // Utilidades
  obtenerTiposEvento(): Observable<TipoEvento[]> {
    return this.http.get<TipoEvento[]>(`${this.apiUrl}/tipos-evento`);
  }

  obtenerTiposEntrada(): Observable<TipoEntrada[]> {
    return this.http.get<TipoEntrada[]>(`${this.apiUrl}/tipos-entrada`);
  }
}
