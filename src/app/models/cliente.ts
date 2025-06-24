export interface Cliente {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  dni: string;
  fechaNacimiento: string;
  fechaRegistro?: string;
  eventosAsistidos?: number;
  pasesGratuitos?: number;
  activo?: boolean;
  esClienteFrecuente?: boolean;
  reservasActivas?: number;
}

export interface ClienteRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  dni: string;
  fechaNacimiento: string;
}

export interface ClienteResumen {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  eventosAsistidos: number;
  pasesGratuitos: number;
}