import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente, ClienteRequest, ClienteResumen } from '../models/cliente';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = 'http://localhost:8080/api/clientes';

  constructor(private http: HttpClient) { }

  // CRUD básico
  crearCliente(cliente: ClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  obtenerCliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  obtenerTodosLosClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  obtenerClientesActivos(): Observable<ClienteResumen[]> {
    return this.http.get<ClienteResumen[]>(`${this.apiUrl}/activos`);
  }

  actualizarCliente(id: number, cliente: ClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  eliminarCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  activarCliente(id: number): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/${id}/activar`, {});
  }

  toggleActivoCliente(id: number, activo: boolean): Observable<void> {
  return activo ? this.activarCliente(id) : this.eliminarCliente(id);
  }

  // Búsquedas
  buscarClientesPorNombre(termino: string): Observable<ClienteResumen[]> {
    return this.http.get<ClienteResumen[]>(`${this.apiUrl}/buscar?termino=${termino}`);
  }

  obtenerClientePorEmail(email: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/email/${email}`);
  }

  // Fidelización
  obtenerClientesFrecuentes(): Observable<ClienteResumen[]> {
    return this.http.get<ClienteResumen[]>(`${this.apiUrl}/frecuentes`);
  }

  obtenerClientesConPasesGratuitos(): Observable<ClienteResumen[]> {
    return this.http.get<ClienteResumen[]>(`${this.apiUrl}/con-pases-gratuitos`);
  }

  puedeUsarPaseGratuito(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${id}/puede-usar-pase-gratuito`);
  }

  usarPaseGratuito(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/usar-pase-gratuito`, {});
  }

  // Validaciones
  existeEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/existe-email/${email}`);
  }

  validarClienteActivo(id: number): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/${id}/validar-activo`);
  }
}
