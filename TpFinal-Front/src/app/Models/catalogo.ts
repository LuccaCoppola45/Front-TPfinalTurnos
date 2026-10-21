export type DiaSemana =
  | 'LUNES'
  | 'MARTES'
  | 'MIERCOLES'
  | 'JUEVES'
  | 'VIERNES'
  | 'SABADO'
  | 'DOMINGO';

export interface Categoria {
  uniqueId: number;
  nombreCategoria: string;
}

export interface CategoriaRequest {
  nombreCategoria: string;
}

export interface Servicio {
  idServicio: number;
  nombreServicio: string;
  duracionDelServicio: number;
  precio: number;
  idComercio: number;
}

export interface ServicioRequest {
  nombreServicio: string;
  duracionDelServicio: number;
  precio: number;
  idComercio: number;
}

export interface HorarioAtencion {
  idHorarioAtencion: number;
  comercioId: number;
  diaSemana: DiaSemana;
  horaApertura: string;
  horaCierre: string;
}

export interface HorarioAtencionRequest {
  comercioId: number;
  diaSemana: DiaSemana;
  horaApertura: string;
  horaCierre: string;
}

export interface Comercio {
  idComercio: number;
  nombre: string;
  direccion: string;
  telefono: string;
  descripcion: string | null;
  categorias: string[] | null;
  servicios: Servicio[] | null;
  horarios: HorarioAtencion[] | null;
  usuarioPropietarioId: number | null;
}

export interface ComercioRequest {
  nombre: string;
  direccion: string;
  telefono: string;
  listaCategoriasIds: number[];
}