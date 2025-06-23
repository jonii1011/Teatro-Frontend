// src/app/models/evento.ts
export interface Evento {
  id?: number;
  nombre: string;
  descripcion: string;
  fechaHora: string; // ISO string format
  tipoEvento: TipoEvento;
  capacidadTotal: number;
  activo?: boolean;
  fechaCreacion?: string;
  tiposEntrada?: TipoEntrada[];
  precios?: { [key: string]: number };
  capacidades?: { [key: string]: number };
  disponibilidadPorTipo?: { [key: string]: number };
  estaVigente?: boolean;
  totalReservasActivas?: number;
}

export interface EventoRequest {
  nombre: string;
  descripcion: string;
  fechaHora: string;
  tipoEvento: TipoEvento;
  capacidadTotal: number;
  configuracionEntradas: { [key: string]: ConfiguracionEntrada };
}

export interface ConfiguracionEntrada {
  precio: number;
  capacidad: number;
}

export interface EventoResumen {
  id: number;
  nombre: string;
  fechaHora: string;
  tipoEvento: TipoEvento;
  capacidadTotal: number;
  capacidadDisponible: number;
  estaVigente: boolean;
  precioDesde: number;
}

export enum TipoEvento {
  OBRA_TEATRO = 'OBRA_TEATRO',
  RECITAL = 'RECITAL',
  CHARLA_CONFERENCIA = 'CHARLA_CONFERENCIA'
}

export enum TipoEntrada {
  // Para obras de teatro
  GENERAL = 'GENERAL',
  VIP = 'VIP',
  // Para recitales
  CAMPO = 'CAMPO',
  PLATEA = 'PLATEA',
  PALCO = 'PALCO',
  // Para charlas
  CON_MEET_GREET = 'CON_MEET_GREET',
  SIN_MEET_GREET = 'SIN_MEET_GREET'
}