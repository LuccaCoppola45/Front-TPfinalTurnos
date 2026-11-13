export type EstadoTurno =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'CANCELADO'
  | 'RESERVADO'
  | 'FINALIZADO';

export interface Turno {
    idTurno: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    estado: EstadoTurno;
    usuarioId: number;
    servicioId: number;
    cancelacionId: number | null;
    idComercio: number;
}

export interface TurnoRequest {
    fecha: string;
    horaInicio: string;
    servicioId: number;
    idComercio: number;
}

/** Datos que muestra la página "¿Vas a ir?" (link del mail de recordatorio). */
export interface ConfirmacionTurno {
    nombreCliente: string;
    nombreComercio: string;
    direccionComercio: string;
    nombreServicio: string;
    fecha: string;
    horaInicio: string;
    estado: EstadoTurno;
}

export interface CancelacionRequest {
    idTurno: number;
    idUsuario: number;
    motivo: string;
}

export interface Cancelacion {
    idCancelacion: number;
    fechaCancelacion: string;
    motivo: string;
    idUsuario: number;
    /** Turno que se canceló (puede faltar en datos viejos) */
    idTurno: number | null;
}




