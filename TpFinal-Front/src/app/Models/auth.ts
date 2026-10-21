export type Rol = 'ADMIN' | 'CLIENTE' | 'COMERCIO';

export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  rol: Rol;
  email: string;
  serviciosId: number[] | null;
  turnosIds: number[] | null;
  cancelacionesIds: number[] | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  mensaje: string;
  token: string;
}

export interface RegistroRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}

export interface ActualizarUsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
}

export interface ActualizarUsuarioResponse {
  success: boolean;
  message: string;
  data: Usuario;
}
