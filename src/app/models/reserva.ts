// src/app/models/reserva.ts
import { Cliente, ClienteResumen } from './cliente';
import { Evento, EventoResumen, TipoEntrada } from './evento';

export interface Reserva {
  id?: number;
  codigoReserva?: string;
  cliente: ClienteResumen;
  evento: EventoResumen;
  tipoEntrada: TipoEntrada;
  fechaReserva?: string;
  estado: EstadoReserva;
  esPaseGratuito: boolean;
  precioPagado?: number;
  fechaConfirmacion?: string;
  fechaCancelacion?: string;
  motivoCancelacion?: string;
  puedeSerCancelada?: boolean;
  estaVigente?: boolean;
}

export interface ReservaRequest {
  clienteId: number;
  eventoId: number;
  tipoEntrada: TipoEntrada;
  usarPaseGratuito: boolean;
}

export interface ReservaResumen {
  id: number;
  codigoReserva: string;
  nombreEvento: string;
  fechaEvento: string;
  tipoEntrada: TipoEntrada;
  estado: EstadoReserva;
  precioPagado?: number;
  esPaseGratuito: boolean;
}

export enum EstadoReserva {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADA = 'CONFIRMADA',
  CANCELADA = 'CANCELADA',
}
