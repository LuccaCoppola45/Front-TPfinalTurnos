export type EstadoSolicitud = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export interface SolicitudConversion {
  id: number;
  usuarioId: number;
  nombreComercioPropuesto: string;
  direccion: string;
  telefono: string;
  descripcion: string;
  estado: EstadoSolicitud;
  fechaSolicitud: string;
}

export interface SolicitudRequest {
  nombreComercioPropuesto: string;
  direccion: string;
  telefono: string;
  descripcion: string;
}